import type {
	IDataObject,
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
					'Copy the Production URL above into the WEBHOOK_URL setting of your NC-WA gateway, then restart it. While testing in the editor, use the Test URL and press "Listen for test event" first.',
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
