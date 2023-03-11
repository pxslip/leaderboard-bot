import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIApplicationCommandInteraction,
	APIInteractionResponseChannelMessageWithSource,
	MessageFlags,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';
import { Generator } from 'snowflake-generator';
import getOptionValue from '../shared/get-option-value.js';

const generator = new Generator();
const dbClient = new DynamoDBClient({});

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'create',
	description: 'Create a new leaderboard',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: (1 << 3).toString(),
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the leaderboard to create, this will disable any other leaderboards in this channel',
			required: true,
		},
	],
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	try {
		if (interaction.data.type === ApplicationCommandType.ChatInput) {
			const name = getOptionValue<string>(interaction, 'name');
			const guildId = interaction.guild_id;
			const channelId = interaction.channel_id;
			if (name && guildId && channelId) {
				console.log('Creating the leaderboard entry in dynamodb');
				const result = await dbClient.send(
					new PutItemCommand({
						TableName: process.env.DB_TABLE_NAME!,
						Item: {
							LeaderboardId: {
								N: generator.generate().toString(),
							},
							GuildAndChannelId: {
								S: `${guildId.toString()}_${channelId.toString()}`,
							},
							GuildId: {
								N: guildId.toString(),
							},
							ChannelId: {
								N: channelId.toString(),
							},
							Timestamp: {
								N: Date.now().toString(),
							},
							Name: {
								S: name,
							},
							Submissions: {
								L: [],
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
							type: InteractionResponseType.ChannelMessageWithSource,
							data: {
								content: `Leaderboard named ${name} created for this channel, all future submissions will be entered for this leaderboard`,
								flags: MessageFlags.Ephemeral,
							},
						} as APIInteractionResponseChannelMessageWithSource),
					};
				}
			}
		}
	} catch (exc) {
		console.error(exc);
	}
	throw new Error('There was an error creating a new leaderboard');
}
