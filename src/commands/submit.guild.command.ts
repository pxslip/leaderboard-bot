import type { APIGatewayProxyResult } from 'aws-lambda';
import {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandInteraction,
	APIModalInteractionResponse,
	ComponentType,
	TextInputStyle,
	PermissionFlagsBits,
} from 'discord-api-types/v10';
import { ApplicationCommandType, InteractionResponseType } from 'discord-api-types/v10';

export const command: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'submit',
	description: 'Submit your entry for the current leaderboard',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: PermissionFlagsBits.SendMessages.toString(),
};

export async function handler(interaction: APIApplicationCommandInteraction): Promise<APIGatewayProxyResult> {
	return {
		statusCode: 200,
		body: JSON.stringify({
			type: InteractionResponseType.Modal,
			data: {
				title: 'Leaderboard Submission Data',
				custom_id: 'leaderboard_bot_submit_modal',
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								custom_id: 'leaderboard_bot_submit_url',
								label: 'Submission URL',
								style: TextInputStyle.Short,
								required: true,
								placeholder: 'https://your.link.here',
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								custom_id: 'leaderboard_bot_board_color',
								label: 'Bingo Board Color',
								style: TextInputStyle.Short,
								required: true,
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								custom_id: 'leaderboard_bot_board_line',
								label: 'Bingo Board Line',
								style: TextInputStyle.Short,
								required: true,
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								custom_id: 'leaderboard_bot_poe_profile',
								label: 'PoE Account Name',
								style: TextInputStyle.Short,
								required: true,
								placeholder: 'YourAwesomePoEAccountNameHere',
							},
						],
					},
				],
			},
		} as APIModalInteractionResponse),
	};
}
