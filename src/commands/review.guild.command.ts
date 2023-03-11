import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { ApplicationCommandType } from 'discord-api-types/v10';
import getLeaderboard, { LeaderboardSubmissionItem } from '../shared/get-leaderboard.js';
import getOptionValue from '../shared/get-option-value.js';
import reviewMessageResponse from '../shared/review-message.js';
import rotateSubmission from '../shared/rotate-submission.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'review',
	description: 'Get information for the oldest submission for review',
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
	console.log(JSON.stringify(interaction));
	const guildId = interaction.guild_id;
	const channelId = getOptionValue<string>(interaction, 'channel') ?? interaction.channel_id;
	if (guildId && channelId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Submissions',
		});
		const submission = await rotateSubmission(leaderboard);
		if (submission) {
			return {
				statusCode: 200,
				body: JSON.stringify(
					reviewMessageResponse({
						leaderboardId: leaderboard.LeaderboardId.N,
						link: submission.Link.S,
						userId: submission.UserId.N,
						timestampMs: submission.Timestamp.N,
						line: submission.Line.S,
						color: submission.Color.S,
						type: InteractionResponseType.ChannelMessageWithSource,
					}),
				),
			};
		}
	}
	throw new Error('There was an error retrieving entry data for review');
}
