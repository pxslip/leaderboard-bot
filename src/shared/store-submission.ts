import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import dbClient, { TABLE_NAME } from './db-client.js';
import getLeaderboard from './get-leaderboard.js';

export interface StoreSubmissionOptions {
	url: string;
	guildId: string;
	channelId: string;
	userId: string;
	color: string;
	line: string;
	account: string;
}

export default async function storeSubmission({
	guildId,
	channelId,
	userId,
	url,
	color,
	line,
	account,
}: StoreSubmissionOptions) {
	const leaderboard = await getLeaderboard(guildId, channelId, { ProjectionExpression: 'LeaderboardId, Submissions' });
	const submissions = leaderboard.Submissions.L;
	if (submissions && leaderboard.LeaderboardId.N) {
		const response = await dbClient.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: { LeaderboardId: { N: leaderboard.LeaderboardId.N } },
				UpdateExpression: 'SET Submissions = list_append(:s, Submissions)',
				ExpressionAttributeValues: {
					':s': {
						L: [
							{
								M: {
									UserId: { N: userId },
									Link: { S: url },
									Timestamp: { N: Date.now().toString() },
									Color: { S: color },
									Line: { S: line },
									AccountName: { S: account },
								},
							},
						],
					},
				},
			}),
		);
		return response;
	}
	throw new Error('Invalid options for storing a submission');
}
