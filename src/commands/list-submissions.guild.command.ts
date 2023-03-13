import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	InteractionResponseType,
	APIInteractionResponseChannelMessageWithSource,
	MessageFlags,
} from 'discord-api-types/v10';
import { ApplicationCommandType } from 'discord-api-types/v10';
import getLeaderboard from '../shared/get-leaderboard.js';
import getOptionValue from '../shared/get-option-value.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'list-submissions',
	description: 'Get a list of all submissions currently in the queue',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'channel',
			description: 'The channel whose leaderboard you would like to confirm submissions for',
		},
	],
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const guildId = interaction.guild_id;
	const channelId = getOptionValue<string>(interaction, 'channel') ?? interaction.channel_id;
	if (guildId && channelId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Submissions, #N',
			ExpressionAttributeNames: { '#N': 'Name' },
		});
		if (leaderboard.Submissions.L.length > 0) {
			const content = leaderboard.Submissions.L.reduce<string>((accumulator, current) => {
				if (current.M) {
					const { Timestamp, UserId, Link } = current.M;
					if (Timestamp.N && UserId.N && Link.S) {
						const seconds = (parseInt(Timestamp.N) / 1000).toFixed();
						accumulator += `> <@${UserId.N}> submitted ${Link.S} on <t:${seconds}:D> at <t:${seconds}:T>\n`;
						return accumulator;
					}
				}
				return accumulator;
			}, `${leaderboard.Name.S} submission queue\n`);
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content,
						allowed_mentions: {
							parse: [],
						},
					},
				} as APIInteractionResponseChannelMessageWithSource),
			};
		} else {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'There are no submissions in the leaderboard associated with the given channel',
						flags: MessageFlags.Ephemeral,
					},
				} as APIInteractionResponseChannelMessageWithSource),
			};
		}
	}
	throw new Error('There was an error retrieving entry data for review');
}
