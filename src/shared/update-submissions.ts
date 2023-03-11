import { AttributeValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import dbClient, { TABLE_NAME } from './db-client.js';

export default async function updateSubmissions(leaderboardId: string, submissions: AttributeValue[]) {
	return await dbClient.send(
		new UpdateItemCommand({
			TableName: TABLE_NAME,
			Key: { LeaderboardId: { N: leaderboardId } },
			UpdateExpression: 'SET Submissions = :s',
			ExpressionAttributeValues: {
				':s': {
					L: submissions,
				},
			},
		}),
	);
}
