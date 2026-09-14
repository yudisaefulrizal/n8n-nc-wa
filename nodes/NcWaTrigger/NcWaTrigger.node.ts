import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class NcWaTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NC-WA Trigger',
		name: 'ncWaTrigger',
		icon: 'file:ncwa.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts a workflow when an NC-WA gateway sends an event',
		defaults: { name: 'NC-WA Trigger' },
		credentials: [{ name: 'ncWaApi', required: true }],
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'This trigger registers its own URL with your gateway when the workflow is activated, and removes it when deactivated. Gateways older than the /webhooks API need the URL copied into WEBHOOK_URL by hand instead.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['message'],
				description: 'Events that should start the workflow',
				options: [
					{
						name: 'Message Received',
						value: 'message',
						description: 'An incoming message from a contact or group',
					},
					{
						name: 'Session Status Changed',
						value: 'session.status',
						description: 'A session connected, disconnected or logged out',
					},
					{
						name: 'QR Code Updated',
						value: 'session.qr',
						description: 'A new QR code is ready to be scanned',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Session ID',
						name: 'sessionId',
						type: 'string',
						default: '',
						description:
							'Only handle events from this session. Leave empty to accept every session.',
					},
					{
						displayName: 'Ignore Groups',
						name: 'ignoreGroups',
						type: 'boolean',
						default: false,
						description: 'Whether to skip messages that come from a group chat',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			/**
			 * n8n memanggil ini sebelum create. Selalu false supaya create tetap
			 * jalan: pendaftaran di gateway aman diulang, dan URL uji berbeda dari
			 * URL produksi sehingga yang terdaftar belum tentu yang sedang dipakai.
			 */
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('ncWaApi');
				const baseUrl = String(credentials.baseUrl ?? '').replace(/\/+$/, '');
				const options = this.getNodeParameter('options', {}) as IDataObject;
				const body: IDataObject = { url: this.getNodeWebhookUrl('default') };
				if (options.sessionId) body.sessionId = options.sessionId;

				try {
					const created = (await this.helpers.requestWithAuthentication.call(this, 'ncWaApi', {
						method: 'POST',
						uri: `${baseUrl}/webhooks`,
						body,
						json: true,
					})) as IDataObject;
					if (created?.id) {
						this.getWorkflowStaticData('node').webhookId = created.id;
					}
					return true;
				} catch (error) {
					// Gateway lama belum punya /webhooks. Jangan halangi aktivasi:
					// pemilik masih bisa memakai WEBHOOK_URL di .env.
					const status = (error as { statusCode?: number }).statusCode;
					if (status === 404) return true;
					throw error;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				const id = data.webhookId as string | undefined;
				if (!id) return true;

				const credentials = await this.getCredentials('ncWaApi');
				const baseUrl = String(credentials.baseUrl ?? '').replace(/\/+$/, '');
				try {
					await this.helpers.requestWithAuthentication.call(this, 'ncWaApi', {
						method: 'DELETE',
						uri: `${baseUrl}/webhooks/${encodeURIComponent(id)}`,
						json: true,
					});
				} catch {
					// Sudah tercabut di sisi gateway, atau gateway tak terjangkau.
					// Menahan penonaktifan workflow karena ini tidak ada gunanya.
				}
				delete data.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const accepted = { webhookResponse: { ok: true } };

		const event = typeof body.event === 'string' ? body.event : '';
		if (!events.includes(event)) return accepted;

		const wanted = (options.sessionId as string) ?? '';
		if (wanted && body.sessionId !== wanted) return accepted;

		if (options.ignoreGroups === true && body.isGroup === true) return accepted;

		return {
			webhookResponse: { ok: true },
			workflowData: [[{ json: body }]],
		};
	}
}
