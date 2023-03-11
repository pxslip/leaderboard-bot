import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionResponseType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import getOptionValue from '../shared/get-option-value.js';
import storeSubmission from '../shared/store-submission.js';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'submit2',
	description: 'Submit to the current leaderboard',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: (1 << 3).toString(),
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'url',
			description: 'A link to your submission video',
			required: true,
		},
	],
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	const url = getOptionValue<string>(interaction, 'url');
	const userId = interaction.member?.user.id ?? interaction.user?.id;
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (url && userId && guildId && channelId) {
		const response = await storeSubmission({ guildId, channelId, userId, url, line: '', color: '' });
		if (response.$metadata.httpStatusCode === 200) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `Your submission was received, a moderator will review and confirm it`,
						flags: (1 << 6).toString(),
					},
				}),
			};
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
