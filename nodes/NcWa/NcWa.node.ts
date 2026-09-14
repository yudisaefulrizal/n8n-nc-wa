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
		description: 'Send WhatsApp messages through an NC-WA gateway',
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
				options: [{ name: 'Message', value: 'message' }],
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
				],
				default: 'sendText',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID of the session in your gateway that sends the message',
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
				displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
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
				const sessionId = encodeURIComponent(this.getNodeParameter('sessionId', i) as string);

				const method: IHttpRequestMethods = 'POST';
				let endpoint = '';
				let body: IDataObject = {};

				if (resource === 'message' && operation === 'sendText') {
					endpoint = `/sessions/${sessionId}/messages/text`;
					body = {
						to: this.getNodeParameter('to', i) as string,
						text: this.getNodeParameter('text', i) as string,
					};
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
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'ncWaApi',
					options,
				);

				out.push({ json: (response ?? {}) as IDataObject, pairedItem: { item: i } });
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
