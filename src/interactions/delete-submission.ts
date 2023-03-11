import { APIGatewayProxyResult } from 'aws-lambda';
import { APIMessageComponentInteraction } from 'discord-api-types/v10';

/**
 * Delete a submission
 * @param interaction
 */
export async function handler(interaction: APIMessageComponentInteraction): Promise<APIGatewayProxyResult> {
	// just need to insert into the most recent leaderboard.Submissions map userid:url
	console.log(interaction.data);
	throw new Error('There was an unknown issue storing the user submission');
}
