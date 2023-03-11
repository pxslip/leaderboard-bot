export function getReviewCustomIdParts(customId: string) {
	const idParts = customId.split('_');
	const leaderboardId = idParts.at(1);
	const submitterId = idParts.at(2);
	const timestamp = idParts.at(3);
	return { leaderboardId, submitterId, timestamp };
}
