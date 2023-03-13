import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	APIInteractionResponseChannelMessageWithSource,
	MessageFlags,
} from 'discord-api-types/v10';
import { ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';
import dbClient, { TABLE_NAME } from '../shared/db-client.js';
import getLeaderboard, { Leaderboard } from '../shared/get-leaderboard.js';
import getOptionValue from '../shared/get-option-value.js';
import { Generator } from 'snowflake-generator';

const generator = new Generator();

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'proxy',
	description: 'Set the channel to proxy leaderboard bot commands to',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: PermissionFlagsBits.SendMessages.toString(),
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'channel',
			description: 'The channel to proxy commands to',
			required: true,
		},
	],
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const guildId = interaction.guild_id;
	const channelId = getOptionValue<string>(interaction, 'channel');
	const currChannelId = interaction.channel_id;
	if (guildId && channelId && currChannelId) {
		let leaderboard: Partial<Leaderboard>;
		try {
			leaderboard = await getLeaderboard(guildId, currChannelId, {
				ProjectionExpression: 'LeaderboardId',
			});
		} catch (exc) {
			// I'm making the assumption that no leaderboard was found
			leaderboard = { LeaderboardId: { N: generator.generate().toString() } };
		}
		const targetLeaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, #N',
			ExpressionAttributeNames: { '#N': 'Name' },
		});
		const newLeaderboardId = targetLeaderboard.LeaderboardId?.N;
		if (newLeaderboardId) {
			const response = await dbClient.send(
				new UpdateItemCommand({
					//TODO: conditional here, update if the leaderboard exists, create if not
					Key: {
						LeaderboardId: {
							N: newLeaderboardId,
						},
					},
					TableName: TABLE_NAME,
					UpdateExpression:
						'SET TargetLeaderboardId = :tli, GuildId = :gi, ChannelId = :ci, GuildAndChannelId = :gci, Timestamp = :ts',
					ExpressionAttributeValues: {
						':tli': {
							N: newLeaderboardId,
						},
						':gi': {
							N: guildId,
						},
						':ci': {
							N: currChannelId,
						},
						':gci': {
							S: `${guildId}_${currChannelId}`,
						},
						':ts': {
							N: Date.now().toString(),
						},
					},
				}),
			);
			if (response.$metadata.httpStatusCode === 200) {
				return {
					statusCode: 200,
					body: JSON.stringify({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `All future leaderboard commands will now proxy to the leaderboard ${targetLeaderboard.Name.S}`,
							flags: MessageFlags.Ephemeral,
						},
					} as APIInteractionResponseChannelMessageWithSource),
				};
			}
		}
	}
	throw new Error('An error occurred creating a channel proxy target');
}
