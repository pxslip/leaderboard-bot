import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIInteractionResponseUpdateMessage,
	APIMessageComponentInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import getLeaderboard, { getLeaderboardById, LeaderboardSubmissionItem } from '../shared/get-leaderboard';
import reviewMessageResponse from '../shared/review-message';

/**
 * Move this submission to the bottom of the queue for later review
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentInteraction): Promise<APIGatewayProxyResult> {
	const idParts = interaction.data.custom_id.split('_');
	const leaderboardId = idParts.at(1);
	const submitterId = idParts.at(2);
	const timestamp = idParts.at(3);
	if (leaderboardId && submitterId && timestamp) {
		const leaderboard = await getLeaderboardById(leaderboardId, {
			ProjectionExpression: 'LeaderboardId, Submissions',
		});
		// move the 0th element to the end
		const first = leaderboard.Submissions.L.pop();
		if (first && first.M?.UserId.N === submitterId && first.M?.Timestamp.N === timestamp) {
			const submission = first.M as unknown as LeaderboardSubmissionItem;
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
						type: InteractionResponseType.UpdateMessage,
						action: {
							status: 'rejected',
							userId: interaction.member?.user.id ?? '',
							timestampMS: Date.now(),
						},
					}),
				),
			};
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
