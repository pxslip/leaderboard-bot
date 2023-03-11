import {
	APIInteractionResponseChannelMessageWithSource,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';

export interface ReviewMessageResponseOptions {
	link: string;
	userId: string;
	timestampMs: string;
	line: string;
	color: string;
	action?: {
		status: 'confirmed' | 'deleted' | 'rejected';
		userId: string;
		timestampMS: number;
	};
}

export default function reviewMessageResponse({
	link,
	userId,
	timestampMs,
	line,
	color,
	action,
}: ReviewMessageResponseOptions): APIInteractionResponseChannelMessageWithSource {
	const seconds = (parseInt(timestampMs) / 1000).toFixed();
	let content = `${link} was submitted by <@${userId}> on <t:${seconds}:D> at <t:${seconds}:T>. They completed line ${line} on the ${color} board`;
	let disableReject = false;
	if (action) {
		const seconds = (action.timestampMS / 1000).toFixed();
		switch (action.status) {
			case 'confirmed':
				break;
			case 'deleted':
				break;
			case 'rejected':
				disableReject = true;
				content = content.concat(
					`\n> This review was rejected by <@${action.userId}> on <t:${seconds}:D> at <t:${seconds}:T>.`,
				);
				break;
		}
	}
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			allowed_mentions: {
				parse: [],
			},
			content,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							custom_id: `confirm_${userId}_${timestampMs}`,
							style: ButtonStyle.Success,
							label: 'Confirm Submission',
						},
						{
							type: ComponentType.Button,
							custom_id: `reject_${userId}_${timestampMs}`,
							style: ButtonStyle.Secondary,
							label: 'Reject Submission',
							disabled: disableReject,
						},
						{
							type: ComponentType.Button,
							custom_id: `delete_${userId}_${timestampMs}`,
							style: ButtonStyle.Danger,
							label: 'Delete Submission',
						},
					],
				},
			],
		},
	};
}
