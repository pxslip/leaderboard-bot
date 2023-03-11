import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import dbClient, { TABLE_NAME } from './db-client.js';
import { Leaderboard, LeaderboardSubmissionItem } from './get-leaderboard.js';

export default async function rotateSubmission(leaderboard: Leaderboard) {
	const submissions = leaderboard.Submissions.L;
	const first = submissions.shift();
	if (first) {
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
			return first.M as unknown as LeaderboardSubmissionItem; //XXX: forcing this using the not null ! marker feels uncomfortable, contemplate if there are better options
		}
	}
	throw new Error('There was an error rotating the submissions queue');
}
