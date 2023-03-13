import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIMessageComponentInteraction,
	APIModalSubmitInteraction,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { getReviewCustomIdParts } from '../shared/get-custom-id-parts';
import { getLeaderboardById } from '../shared/get-leaderboard';
import reviewMessageResponse from '../shared/review-message';
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
		console.log(leaderboard);
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
								case 'entry_minutes':
									num = parseInt(mComponent.value);
									if (!isNaN(num)) {
										time += num * 60;
									}
									break;
								case 'entry_seconds':
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
					console.log(url);
					const entryResponse = await storeEntry({ leaderboardId, userId: submitterId, url, color, line, time });
					if (entryResponse.$metadata.httpStatusCode === 200) {
						console.log(entryResponse);
						// remove the submission from the list
						const response = await updateSubmissions(leaderboardId, submissions);
						if (response.$metadata.httpStatusCode === 200) {
							return {
								statusCode: 200,
								body: JSON.stringify(
									reviewMessageResponse({
										leaderboardId: leaderboard.LeaderboardId.N,
										link: url,
										userId: submitterId,
										timestampMs: timestamp,
										line: line,
										color: color,
										type: InteractionResponseType.UpdateMessage,
										action: {
											status: 'confirmed',
											userId: interaction.member?.user.id ?? '',
											timestampMS: Date.now(),
										},
									}),
								),
							};
						}
					}
				}
			}
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
