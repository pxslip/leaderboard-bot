import type { APIGatewayProxyResult } from 'aws-lambda';
import type {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	APIInteractionResponseChannelMessageWithSource,
} from 'discord-api-types/v10';
import { ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';
import getLeaderboard from '../shared/get-leaderboard.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'get',
	description: 'Get the leaderboard data for the current channel',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: (1 << 11).toString(),
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (guildId && channelId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Entries, Name',
		});
		const entries = leaderboard.Entries.L;
		if (entries && entries.length > 0) {
			const entriesText = entries?.reduce<string>((accumulator, current, index) => {
				const row = `> ${index + 1}. ${current.M?.entrant.S} ${current.M?.time.S}`;
				accumulator = `${accumulator}\n${row}`;
				return accumulator;
			}, '');
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `__**${leaderboard.Name.S}**__\n${entriesText}`,
					},
				} as APIInteractionResponseChannelMessageWithSource),
			};
		} else {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `__**${leaderboard.Name.S}**__\n> No entries`,
					},
				}),
			};
		}
	}
	return {
		statusCode: 200,
		body: JSON.stringify({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content: 'Woah, that is an error' },
			flags: 1 << 6,
		}),
	};
}