import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	APIInteractionResponseChannelMessageWithSource,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';
import getLeaderboard from '../shared/get-leaderboard.js';
import getOptionValue from '../shared/get-option-value.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'get',
	description: 'Get the leaderboard data for the current channel',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: PermissionFlagsBits.SendMessages.toString(),
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'channel',
			description: 'The channel where submissions are created (e.g. #submit-links-here)',
		},
	],
};

export const secondsToReadable = (timeIn: string) => {
	let timeString = 'unknown';
	const time = parseFloat(timeIn ?? 'NaN');
	if (!isNaN(time)) {
		const hrs = Math.floor(time / 3600);
		const minutes = Math.floor((time - hrs / 3600) / 60);
		const seconds = time - hrs * 3600 - minutes * 60;
		if (!!hrs && hrs > 0) {
			if (!!minutes && minutes > 0) {
				timeString = `${hrs}h ${minutes}m ${seconds}s`;
			} else {
				timeString = `${hrs}h ${seconds}s`;
			}
		}
		if (!!minutes && minutes > 0) {
			timeString = `${minutes}m ${seconds}s`;
		}
		timeString = `${seconds}s`;
	}
	return timeString;
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const guildId = interaction.guild_id;
	const channelId = getOptionValue<string>(interaction, 'channel') ?? interaction.channel_id;
	if (guildId && channelId) {
		const leaderboard = await getLeaderboard(guildId, channelId, {
			ProjectionExpression: 'LeaderboardId, Entries, #N',
			ExpressionAttributeNames: { '#N': 'Name' },
		});
		const entries = leaderboard.Entries.L;
		if (entries && entries.length > 0) {
			const entriesText = entries
				?.sort((a, b) => {
					const timeA = parseFloat(a.M?.Time.N ?? '0');
					const timeB = parseFloat(b.M?.Time.N ?? '0');
					return timeA - timeB;
				})
				.reduce<string>((accumulator, current, index) => {
					const row = `> ${index + 1}. <@${current.M?.UserId.N}> completed ${current.M?.Line.S} on ${
						current.M?.Color.S
					} in ${secondsToReadable(current.M?.Time.N ?? 'unknown')} seconds. `;
					accumulator = `${accumulator}\n${row}`;
					return accumulator;
				}, '');
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `__**${leaderboard.Name.S}**__\n${entriesText}`,
						allowed_mentions: {
							parse: [],
						},
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
