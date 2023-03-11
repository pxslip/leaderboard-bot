import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIMessageComponentInteraction,
	APIModalInteractionResponse,
	ComponentType,
	InteractionResponseType,
	TextInputStyle,
} from 'discord-api-types/v10';
import { getReviewCustomIdParts } from '../shared/get-custom-id-parts';
import { getLeaderboardById } from '../shared/get-leaderboard';

/**
 * Move this submission to an entry in the leaderboard
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentInteraction): Promise<APIGatewayProxyResult> {
	const { leaderboardId, submitterId, timestamp } = getReviewCustomIdParts(interaction.data.custom_id);
	if (leaderboardId && submitterId && timestamp) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				type: InteractionResponseType.Modal,
				data: {
					title: 'Leaderboard Submission Data',
					custom_id: `modal-confirm_${leaderboardId}_${submitterId}_${timestamp}`,
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: 'entry_hours',
									label: 'Hours',
									style: TextInputStyle.Short,
									required: true,
									placeholder: 'https://your.link.here',
								},
								{
									type: ComponentType.TextInput,
									custom_id: 'entry_minutes',
									label: 'Minutes',
									style: TextInputStyle.Short,
									required: true,
									placeholder: 'https://your.link.here',
								},
								{
									type: ComponentType.TextInput,
									custom_id: 'entry_seconds',
									label: 'Seconds',
									style: TextInputStyle.Short,
									required: true,
									placeholder: 'https://your.link.here',
								},
							],
						},
					],
				},
			} as APIModalInteractionResponse),
		};
	}
	throw new Error('There was an error generating the confirm submission modal');
}
