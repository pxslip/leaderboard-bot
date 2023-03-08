import type { APIGatewayProxyResult } from 'aws-lambda';
import { InteractionResponseType } from 'discord-interactions';
import type { ApplicationCommandDefinition, Interaction } from '../../types/discord.d';
import { ApplicationCommandOptionsType, ApplicationCommandType } from '../enums.js';

export const command: ApplicationCommandDefinition = {
	name: 'submit',
	type: ApplicationCommandType.CHAT_INPUT,
	default_member_permissions: (1 << 11).toString(),
	options: [
		{
			type: ApplicationCommandOptionsType.STRING,
			name: 'url',
			description: 'The url to your submission video',
			required: true,
		},
	],
};

export async function handler(interaction: Interaction): Promise<APIGatewayProxyResult> {
	console.log(JSON.stringify(interaction));
	return {
		statusCode: 200,
		body: JSON.stringify(
			{
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: { content: 'Fake submitted' },
			},
			(key, value) => {
				// this is necessary to convert the enum values to strings
				if (key === 'type' && typeof value === 'number') {
					return value.toString();
				}
			},
		),
	};
}
