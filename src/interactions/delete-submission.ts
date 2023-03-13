import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIInteractionResponseChannelMessageWithSource,
	APIMessageComponentInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { getReviewCustomIdParts } from '../shared/get-custom-id-parts';
import { getLeaderboardById, LeaderboardSubmissionItem } from '../shared/get-leaderboard';
import reviewMessageResponse from '../shared/review-message';
import updateSubmissions from '../shared/update-submissions';

/**
 * Delete a submission
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentInteraction): Promise<APIGatewayProxyResult> {
	const { leaderboardId, submitterId, timestamp } = getReviewCustomIdParts(interaction.data.custom_id);
	if (leaderboardId && submitterId && timestamp) {
		const leaderboard = await getLeaderboardById(leaderboardId, {
			ProjectionExpression: 'LeaderboardId, Submissions',
		});
		const submissions = leaderboard.Submissions.L;
		if (submissions.length > 0) {
			const index = submissions.findIndex((value) => {
				return value.M?.UserId.N === submitterId && value.M?.Timestamp.N === timestamp;
			});
			const submission = submissions.splice(index, 1)[0].M as unknown as LeaderboardSubmissionItem;
			if (submission) {
				const response = await updateSubmissions(leaderboardId, submissions);
				if (response.$metadata.httpStatusCode === 200) {
					const userId = interaction.member?.user.id;
					if (userId) {
						return {
							statusCode: 200,
							body: JSON.stringify(
								reviewMessageResponse({
									leaderboardId,
									link: submission.Link.S,
									userId: submitterId,
									timestampMs: timestamp,
									line: submission.Line.S,
									color: submission.Color.S,
									type: InteractionResponseType.UpdateMessage,
									action: {
										status: 'deleted',
										timestampMS: Date.now(),
										userId: userId,
									},
								}),
							),
						};
					}
				}
			}
		} else if (submissions.length <= 0) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'There are no submissions in the leaderboard associated with the given channel',
					},
				} as APIInteractionResponseChannelMessageWithSource),
			};
		}
	}
	throw new Error('There was an error deleting the user submission');
}
