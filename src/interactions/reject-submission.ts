import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIInteractionResponseUpdateMessage,
	APIMessageComponentButtonInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import dbClient, { TABLE_NAME } from '../shared/db-client';
import getLeaderboard, { LeaderboardSubmissionItem } from '../shared/get-leaderboard';
import reviewMessageResponse from '../shared/review-message';

/**
 * Move this submission to the bottom of the queue for later review
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentButtonInteraction): Promise<APIGatewayProxyResult> {
	console.log(interaction.data);
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (guildId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Submissions',
		});
		// move the 0th element to the end
		const submissions = leaderboard.Submissions.L;
		const first = submissions.shift();
		const idParts = interaction.data.custom_id.split('_');
		const submitterId = idParts.at(1);
		const timestamp = idParts.at(2);
		if (first && first.M?.UserId.N === submitterId && first.M?.Timestamp.N === timestamp) {
			submissions.push(first);
			const response = await dbClient.send(
				new UpdateItemCommand({
					TableName: TABLE_NAME,
					Key: { LeaderboardId: { N: leaderboard.LeaderboardId.N } },
					UpdateExpression: 'SET Submissions = :s',
					ExpressionAttributeValues: {
						':s': {
							L: submissions,
						},
					},
				}),
			);
			if (response.$metadata.httpStatusCode === 200) {
				const submission = first.M! as unknown as LeaderboardSubmissionItem; //XXX: forcing this using the not null ! marker feels uncomfortable, contemplate if there are better options
				return {
					statusCode: 200,
					body: JSON.stringify({
						type: InteractionResponseType.UpdateMessage,
						data: JSON.stringify(
							reviewMessageResponse({
								link: submission.Link.S,
								userId: submission.UserId.N,
								timestampMs: submission.Timestamp.N,
								line: submission.Line.S,
								color: submission.Color.S,
								action: {
									status: 'rejected',
									userId: interaction.member?.user.id ?? '',
									timestampMS: Date.now(),
								},
							}),
						),
					} as APIInteractionResponseUpdateMessage),
				};
			}
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
