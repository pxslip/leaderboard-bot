import { APIGatewayProxyResult } from 'aws-lambda';
import {
	APIInteractionResponseChannelMessageWithSource,
	APIMessageComponentButtonInteraction,
	APIModalSubmitInteraction,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
} from 'discord-api-types/v10';
import storeSubmission from '../shared/store-submission';

/**
 * Delete a submission
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentButtonInteraction): Promise<APIGatewayProxyResult> {
	// just need to insert into the most recent leaderboard.Submissions map userid:url
	console.log(interaction.data);
	throw new Error('There was an unknown issue storing the user submission');
}
