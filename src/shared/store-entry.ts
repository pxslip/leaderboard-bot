import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import dbClient, { TABLE_NAME } from './db-client.js';
import getLeaderboard from './get-leaderboard.js';

export interface StoreEntryOptions {
	leaderboardId: string;
	url: string;
	userId: string;
	color: string;
	line: string;
	time: number;
}

export default async function storeEntry({ leaderboardId, userId, url, color, line, time }: StoreEntryOptions) {
	if (leaderboardId) {
		const response = await dbClient.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: { LeaderboardId: { N: leaderboardId } },
				UpdateExpression: 'SET Entries = list_append(Entries, :s)',
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
									Time: { N: time.toString() },
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
