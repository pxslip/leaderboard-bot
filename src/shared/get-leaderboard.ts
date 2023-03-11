import { AttributeValue, QueryCommand } from '@aws-sdk/client-dynamodb';
import dbClient from './db-client.js';

interface Leaderboard {
	LeaderboardId: AttributeValue.NMember;
	Timestamp: AttributeValue.NMember;
	ChannelId: AttributeValue.NMember;
	GuildId: AttributeValue.NMember;
	GuildAndChannelId: AttributeValue.SMember;
	Name: AttributeValue.SMember;
	Entries: AttributeValue.LMember;
	Submissions: AttributeValue.LMember;
}

export interface LeaderboardSubmissionItem {
	UserId: AttributeValue.NMember;
	Link: AttributeValue.SMember;
	Timestamp: AttributeValue.NMember;
	Color: AttributeValue.SMember;
	Line: AttributeValue.SMember;
}

interface GetLeaderboardOptions {
	ProjectionExpression: string;
}

export default async function getLeaderboard(
	guildId: string,
	channelId: string,
	{ ProjectionExpression = 'LeaderboardId, Name, Submissions, Entries' }: GetLeaderboardOptions,
): Promise<Leaderboard> {
	const leaderboards = await dbClient.send(
		new QueryCommand({
			TableName: process.env.DB_TABLE_NAME,
			IndexName: 'guildAndChannel',
			KeyConditionExpression: 'GuildAndChannelId = :guildAndChannelId',
			ExpressionAttributeValues: { ':guildAndChannelId': { S: `${guildId.toString()}_${channelId.toString()}` } },
			Limit: 1,
			ScanIndexForward: false,
			ProjectionExpression,
		}),
	);
	if (leaderboards.$metadata.httpStatusCode === 200 && leaderboards.Items?.length) {
		const leaderboard = leaderboards.Items[0];
		return leaderboard as unknown as Leaderboard; // TODO: is there a better way to type this?
	}
	throw new Error(`Leaderboard for guild: ${guildId} and channel: ${channelId} not found`);
}
