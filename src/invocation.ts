import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	type APIApplicationCommandInteraction,
	APIInteraction,
	InteractionType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import commands from './commands';
import interactions from './interactions';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const { PUBLIC_KEY = '' } = process.env;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const {
			body: rawBody = '',
			headers: { 'x-signature-ed25519': signature = '', 'x-signature-timestamp': timestamp = '' },
		} = event;
		const isVerified = verifyKey(rawBody ?? '', signature, timestamp, PUBLIC_KEY);
		if (rawBody && isVerified) {
			const body = JSON.parse(rawBody) as APIInteraction;
			if (body.type === InteractionType.Ping) {
				return {
					statusCode: 200,
					body: JSON.stringify({
						type: InteractionResponseType.Pong,
					}),
				};
			} else if (body.type === InteractionType.ApplicationCommand) {
				const commandName = body.data.name as keyof typeof commands;
				if (commands[commandName]) {
					console.log(`Executing command ${commandName}`);
					const response = await commands[commandName](body as APIApplicationCommandInteraction);
					return response;
				} else {
					console.error(`Command ${commandName} not found, was it imported?`);
				}
			} else if (body.type === InteractionType.ModalSubmit) {
				console.log(`Executing handler for modal ${body.data.custom_id}`);
				if (body.data.custom_id === 'leaderboard_bot_submit_modal') {
					return await interactions['storeSubmission'](body);
				} else if (body.data.custom_id.startsWith('confirm-modal')) {
					return await interactions.storeEntry(body);
				}
			} else if (body.type === InteractionType.MessageComponent) {
				console.log(`Executing handler for ${body.data.custom_id}`);
				let response;
				if (body.data.custom_id.startsWith('confirm')) {
					response = await interactions.confirmSubmission(body);
				} else if (body.data.custom_id.startsWith('reject')) {
					response = await interactions.rejectSubmission(body);
				} else if (body.data.custom_id.startsWith('delete')) {
					response = await interactions.deleteSubmission(body);
				}
				console.log(JSON.stringify(response));
				if (response) {
					return response;
				}
			}
		}
	} catch (exc) {
		if (exc instanceof Error) {
			console.error(exc.message);
			console.error(exc.stack);
		}
	}
	return {
		statusCode: 200,
		body: JSON.stringify({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: 'Uh oh, that is an error',
				flags: (1 << 6).toString(),
			},
		}),
	};
}
