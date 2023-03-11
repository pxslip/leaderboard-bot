import {
	APIApplicationCommandInteraction,
	APIApplicationCommandInteractionDataBasicOption,
	ApplicationCommandType,
} from 'discord-api-types/v10';

export default function getOptionValue<T extends string | number | boolean>(
	interaction: APIApplicationCommandInteraction,
	option: string,
): T | undefined {
	if (interaction.data.type === ApplicationCommandType.ChatInput) {
		return (
			interaction.data.options?.find((opt) => opt.name === option) as APIApplicationCommandInteractionDataBasicOption
		).value as T;
	}
}
