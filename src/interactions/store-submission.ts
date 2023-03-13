import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIInteractionResponseChannelMessageWithSource,
	APIModalSubmitInteraction,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import storeSubmission, { StoreSubmissionOptions } from '../shared/store-submission';

export async function handler(interaction: APIModalSubmitInteraction): Promise<APIGatewayProxyResult> {
	// just need to insert into the most recent leaderboard.Submissions map userid:url
	const userId = interaction.member?.user.id;
	const guildId = interaction.guild_id;
	const channelId = interaction.channel_id;
	if (userId && guildId && channelId) {
		let submission: StoreSubmissionOptions = {
			guildId,
			channelId,
			userId,
			url: '',
			color: '',
			line: '',
		};
		interaction.data.components.forEach((component) => {
			if (component.type === ComponentType.ActionRow) {
				component.components.forEach((mComponent) => {
					switch (mComponent.custom_id) {
						case 'leaderboard_bot_submit_url':
							submission.url = mComponent.value;
							break;
						case 'leaderboard_bot_board_color':
							submission.color = mComponent.value;
							break;
						case 'leaderboard_bot_board_line':
							submission.line = mComponent.value;
							break;
					}
				});
			}
		});
		const response = await storeSubmission(submission);
		if (response.$metadata.httpStatusCode === 200) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `<@${userId}> submitted ${submission.url}, they completed ${submission.line} on ${submission.color}`,
						allowed_mentions: {
							parse: [],
						},
					},
				} as APIInteractionResponseChannelMessageWithSource),
			};
		}
	}
	throw new Error('There was an unknown issue storing the user submission');
}
