import type { APIGatewayProxyResult } from 'aws-lambda';
import type { ApplicationCommandDefinition, Interaction } from '../../types/discord.d';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ApplicationCommandOptionsType, ApplicationCommandType } from '../enums.js';
import { Generator } from 'snowflake-generator';
import { InteractionResponseType } from 'discord-interactions';

export const command: ApplicationCommandDefinition = {
	name: 'create',
	// type: ApplicationCommandType.CHAT_INPUT,
	default_member_permissions: 1 << 3,
	options: [
		{
			type: ApplicationCommandOptionsType.STRING,
			name: 'name',
			description: 'The name of the leaderboard to create, this will disable any other leaderboards in this channel',
			required: true,
		},
	],
};

const generator = new Generator();
const dbClient = new DynamoDBClient({});

export async function handler(interaction: Interaction): Promise<APIGatewayProxyResult> {
	const name = interaction.data?.options?.find((opts) => opts.name === 'Name')?.value;
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (name && guildId && channelId) {
		const result = await dbClient.send(
			new PutItemCommand({
				TableName: process.env.DB_TABLE_NAME!,
				Item: {
					LeaderboardId: {
						N: generator.generate().toString(),
					},
					Name: {
						S: name,
					},
					GuildId: {
						N: guildId.toString(),
					},
					ChannelId: {
						N: channelId.toString(),
					},
					Submissions: {
						M: {},
					},
					Entries: {
						L: [],
					},
				},
			}),
		);
		if (result.$metadata.httpStatusCode === 200) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `Leaderboard named ${name} created for this channel, all future submissions will be entered for this leaderboard`,
					},
					flags: (1 << 6).toString(),
				}),
			};
		}
	}
	return {
		statusCode: 404,
		body: JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Woah, that's an error`,
			},
		}),
	};
}
