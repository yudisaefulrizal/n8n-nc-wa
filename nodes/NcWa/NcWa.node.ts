import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class NcWa implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NC-WA',
		name: 'ncWa',
		icon: 'file:ncwa.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages and manage sessions through an NC-WA gateway',
		defaults: { name: 'NC-WA' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'ncWaApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Session', value: 'session' },
				],
				default: 'message',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						action: 'Send a text message',
						description: 'Send a plain text message to a contact or group',
					},
					{
						name: 'Send Media',
						value: 'sendMedia',
						action: 'Send a media message',
						description: 'Send an image, document, audio or video from a public URL',
					},
					{
						name: 'Send Typing',
						value: 'typing',
						action: 'Send a typing indicator',
						description: 'Show or clear the typing indicator in a chat',
					},
					{
						name: 'Mark as Read',
						value: 'read',
						action: 'Mark a message as read',
						description: 'Mark one received message as read',
					},
				],
				default: 'sendText',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['session'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a session',
						description: 'Create a new WhatsApp session',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a session',
						description: 'Delete a session and its stored credentials',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a session',
						description: 'Get details of one session',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many sessions',
						description: 'Get every session known to the gateway',
					},
					{
						name: 'Get QR Code',
						value: 'qr',
						action: 'Get a session qr code',
						description: 'Get the QR code used to pair a session',
					},
					{
						name: 'Log Out',
						value: 'logout',
						action: 'Log out a session',
						description: 'Log out of WhatsApp without deleting the session',
					},
					{
						name: 'Reconnect',
						value: 'reconnect',
						action: 'Reconnect a session',
						description: 'Reconnect a session that dropped its connection',
					},
				],
				default: 'create',
			},

			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'default',
				description: 'ID of the session in your gateway',
				displayOptions: { show: { resource: ['message'] } },
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'default',
				description: 'ID of the session in your gateway',
				displayOptions: {
					show: {
						resource: ['session'],
						operation: ['create', 'delete', 'get', 'qr', 'logout', 'reconnect'],
					},
				},
			},

			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				required: true,
				placeholder: '628123456789',
				description:
					'International number without a leading +, or a group ID ending in @g.us',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText', 'sendMedia', 'typing'] },
				},
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				description: 'Message body to send',
				displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
			},

			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				options: [
					{ name: 'Audio', value: 'audio' },
					{ name: 'Document', value: 'document' },
					{ name: 'Image', value: 'image' },
					{ name: 'Video', value: 'video' },
				],
				default: 'image',
				required: true,
				description: 'Kind of media to send',
				displayOptions: { show: { resource: ['message'], operation: ['sendMedia'] } },
			},
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com/photo.jpg',
				description:
					'Public HTTP or HTTPS URL. Your gateway downloads it, so it must be reachable from the gateway server.',
				displayOptions: { show: { resource: ['message'], operation: ['sendMedia'] } },
			},
			{
				displayName: 'Options',
				name: 'mediaOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['message'], operation: ['sendMedia'] } },
				options: [
					{
						displayName: 'Caption',
						name: 'caption',
						type: 'string',
						default: '',
						description: 'Text shown together with the media',
					},
					{
						displayName: 'File Name',
						name: 'filename',
						type: 'string',
						default: '',
						description: 'File name the recipient sees',
					},
				],
			},

			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Typing', value: 'composing' },
					{ name: 'Recording', value: 'recording' },
					{ name: 'Paused', value: 'paused' },
				],
				default: 'composing',
				description: 'Indicator to show in the chat',
				displayOptions: { show: { resource: ['message'], operation: ['typing'] } },
			},

			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				required: true,
				placeholder: '628123456789',
				description: 'Chat the message came from, as a number or a group ID',
				displayOptions: { show: { resource: ['message'], operation: ['read'] } },
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID of the message to mark as read',
				displayOptions: { show: { resource: ['message'], operation: ['read'] } },
			},
			{
				displayName: 'Options',
				name: 'readOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['message'], operation: ['read'] } },
				options: [
					{
						displayName: 'Sender',
						name: 'sender',
						type: 'string',
						default: '',
						description:
							'Who sent the message inside a group. Leave empty for direct chats.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('ncWaApi');
		const baseUrl = String(credentials.baseUrl ?? '').replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const needsSession = !(resource === 'session' && operation === 'getAll');
				const sessionId = needsSession
					? encodeURIComponent(this.getNodeParameter('sessionId', i) as string)
					: '';

				let method: IHttpRequestMethods = 'POST';
				let endpoint = '';
				let body: IDataObject = {};

				if (resource === 'message') {
					if (operation === 'sendText') {
						endpoint = `/sessions/${sessionId}/messages/text`;
						body = {
							to: this.getNodeParameter('to', i) as string,
							text: this.getNodeParameter('text', i) as string,
						};
					} else if (operation === 'sendMedia') {
						const extra = this.getNodeParameter('mediaOptions', i, {}) as IDataObject;
						endpoint = `/sessions/${sessionId}/messages/media`;
						body = {
							to: this.getNodeParameter('to', i) as string,
							type: this.getNodeParameter('mediaType', i) as string,
							url: this.getNodeParameter('url', i) as string,
						};
						if (extra.caption) body.caption = extra.caption;
						if (extra.filename) body.filename = extra.filename;
					} else if (operation === 'typing') {
						endpoint = `/sessions/${sessionId}/typing`;
						body = {
							to: this.getNodeParameter('to', i) as string,
							state: this.getNodeParameter('state', i) as string,
						};
					} else if (operation === 'read') {
						const extra = this.getNodeParameter('readOptions', i, {}) as IDataObject;
						endpoint = `/sessions/${sessionId}/read`;
						body = {
							from: this.getNodeParameter('from', i) as string,
							messageId: this.getNodeParameter('messageId', i) as string,
						};
						if (extra.sender) body.sender = extra.sender;
					}
				} else if (resource === 'session') {
					if (operation === 'create') {
						endpoint = '/sessions';
						body = { id: this.getNodeParameter('sessionId', i) as string };
					} else if (operation === 'get') {
						method = 'GET';
						endpoint = `/sessions/${sessionId}`;
					} else if (operation === 'getAll') {
						method = 'GET';
						endpoint = '/sessions';
					} else if (operation === 'qr') {
						method = 'GET';
						endpoint = `/sessions/${sessionId}/qr`;
					} else if (operation === 'reconnect') {
						endpoint = `/sessions/${sessionId}/reconnect`;
					} else if (operation === 'logout') {
						endpoint = `/sessions/${sessionId}/logout`;
					} else if (operation === 'delete') {
						method = 'DELETE';
						endpoint = `/sessions/${sessionId}`;
					}
				}

				if (!endpoint) {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation ${resource}: ${operation}`,
						{ itemIndex: i },
					);
				}

				const options: IRequestOptions = {
					method,
					uri: `${baseUrl}${endpoint}`,
					json: true,
				};
				if (method === 'POST') options.body = body;

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'ncWaApi',
					options,
				);

				if (Array.isArray(response)) {
					out.push(
						...response.map((entry) => ({
							json: entry as IDataObject,
							pairedItem: { item: i },
						})),
					);
				} else {
					out.push({ json: (response ?? {}) as IDataObject, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [out];
	}
}
