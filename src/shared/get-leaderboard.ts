import {
	AttributeValue,
	GetItemCommand,
	GetItemCommandInput,
	QueryCommand,
	QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import dbClient, { TABLE_NAME } from './db-client.js';

export interface Leaderboard {
	LeaderboardId: AttributeValue.NMember;
	Timestamp: AttributeValue.NMember;
	ChannelId: AttributeValue.NMember;
	GuildId: AttributeValue.NMember;
	GuildAndChannelId: AttributeValue.SMember;
	Name: AttributeValue.SMember;
	Entries: AttributeValue.LMember;
	Submissions: AttributeValue.LMember;
	TargetLeaderboardId?: AttributeValue.NMember;
}

export interface LeaderboardSubmissionItem {
	UserId: AttributeValue.NMember;
	Link: AttributeValue.SMember;
	Timestamp: AttributeValue.NMember;
	Color: AttributeValue.SMember;
	Line: AttributeValue.SMember;
	AccountName: AttributeValue.SMember;
}

interface GetLeaderboardOptions {
	ProjectionExpression: string;
	ExpressionAttributeNames?: Record<string, string>;
}

export default async function getLeaderboard(
	guildId: string,
	channelId: string,
	{
		ProjectionExpression = 'LeaderboardId, TargetLeaderboardId, Submissions, Entries',
		ExpressionAttributeNames,
	}: GetLeaderboardOptions,
): Promise<Leaderboard> {
	if (!ProjectionExpression.includes('TargetLeaderboardId')) {
		ProjectionExpression = ProjectionExpression.concat(', TargetLeaderboardId');
	}
	const command = {
		TableName: TABLE_NAME,
		IndexName: 'guildAndChannel',
		KeyConditionExpression: 'GuildAndChannelId = :guildAndChannelId',
		ExpressionAttributeValues: { ':guildAndChannelId': { S: `${guildId.toString()}_${channelId.toString()}` } },
		Limit: 1,
		ScanIndexForward: false,
		ProjectionExpression,
	} as QueryCommandInput;
	if (ExpressionAttributeNames) {
		command.ExpressionAttributeNames = ExpressionAttributeNames;
	}
	const leaderboards = await dbClient.send(new QueryCommand(command));
	if (leaderboards.$metadata.httpStatusCode === 200 && leaderboards.Items?.length) {
		let leaderboard = leaderboards.Items[0] as unknown as Leaderboard;
		if (leaderboard.TargetLeaderboardId?.N) {
			// this is a proxy request, get the real leaderboard
			leaderboard = await getLeaderboardById(leaderboard.TargetLeaderboardId.N, {
				ProjectionExpression,
				ExpressionAttributeNames,
			});
		}
		return leaderboard as unknown as Leaderboard; // TODO: is there a better way to type this?
	}
	throw new Error(`Leaderboard for guild: ${guildId} and channel: ${channelId} not found`);
}

export async function getLeaderboardById(
	leaderboardId: string,
	{
		ProjectionExpression = 'LeaderboardId, Name, Submissions, Entries',
		ExpressionAttributeNames,
	}: GetLeaderboardOptions,
) {
	const command = {
		TableName: TABLE_NAME,
		Key: { LeaderboardId: { N: leaderboardId } },
		ProjectionExpression,
	} as GetItemCommandInput;
	if (ExpressionAttributeNames) {
		command.ExpressionAttributeNames = ExpressionAttributeNames;
	}
	const response = await dbClient.send(new GetItemCommand(command));
	if (response.$metadata.httpStatusCode === 200) {
		return response.Item as unknown as Leaderboard;
	}
	throw new Error('The leaderboard specified was not found');
}
