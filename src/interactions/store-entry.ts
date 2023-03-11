import { APIGatewayProxyResult } from 'aws-lambda';
import { APIMessageComponentInteraction, APIModalSubmitInteraction, ComponentType } from 'discord-api-types/v10';
import { getReviewCustomIdParts } from '../shared/get-custom-id-parts';
import { getLeaderboardById } from '../shared/get-leaderboard';
import storeEntry from '../shared/store-entry';
import updateSubmissions from '../shared/update-submissions';

/**
 * Move this submission to an entry in the leaderboard
 * @param interaction
 */
export async function handler(interaction: APIModalSubmitInteraction): Promise<APIGatewayProxyResult> {
	const { leaderboardId, submitterId, timestamp } = getReviewCustomIdParts(interaction.data.custom_id);
	if (leaderboardId && submitterId && timestamp) {
		const leaderboard = await getLeaderboardById(leaderboardId, {
			ProjectionExpression: 'LeaderboardId, Submissions',
		});
		const submissions = leaderboard.Submissions.L;
		if (submissions) {
			const index = submissions.findIndex(({ M: submission }) => {
				if (submission) {
					return submission.UserId.N === submitterId && submission.Timestamp.N === timestamp;
				}
			});
			const submission = submissions.splice(index, 1)[0];
			if (submission) {
				let time: number = 0;
				interaction.data.components.forEach((component) => {
					if (component.type === ComponentType.ActionRow) {
						component.components.forEach((mComponent) => {
							let num = 0;
							switch (mComponent.custom_id) {
								case 'entry_hours':
									num = parseInt(mComponent.value);
									if (!isNaN(num)) {
										time += num * 60 * 60;
									}
									break;
								case 'leaderboard_bot_board_color':
									num = parseInt(mComponent.value);
									if (!isNaN(num)) {
										time += num * 60;
									}
									break;
								case 'leaderboard_bot_board_line':
									num = parseFloat(mComponent.value);
									if (!isNaN(num)) {
										time += num;
									}
									break;
							}
						});
					}
				});
				const url = submission.M?.Link.S;
				const color = submission.M?.Color.S;
				const line = submission.M?.Line.S;
				if (url && color && line) {
					const entryResponse = await storeEntry({ leaderboardId, userId: submitterId, url, color, line, time });
					if (entryResponse.$metadata.httpStatusCode === 200) {
						// remove the submission from the list
						updateSubmissions(leaderboardId, submissions);
					}
				}
			}
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
