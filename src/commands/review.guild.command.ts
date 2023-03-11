import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';
import getLeaderboard, { LeaderboardSubmissionItem } from '../shared/get-leaderboard.js';
import reviewMessageResponse from '../shared/review-message.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'review',
	description: 'Get information for the oldest submission for review',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'Leaderboard Channel',
			description: 'The channel whose leaderboard you would like to confirm submissions for',
		},
	],
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (guildId && channelId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Submissions[0]',
		});
		const submission = leaderboard.Submissions.L[0].M as unknown as LeaderboardSubmissionItem;
		if (submission) {
			const seconds = (parseInt(submission.Timestamp.N) / 1000).toFixed();
			return {
				statusCode: 200,
				body: JSON.stringify(
					reviewMessageResponse({
						link: submission.Link.S,
						userId: submission.UserId.N,
						timestampMs: submission.Timestamp.N,
						line: submission.Line.S,
						color: submission.Color.S,
					}),
				),
			};
		}
	}
	throw new Error('There was an error retrieving entry data for review');
}
