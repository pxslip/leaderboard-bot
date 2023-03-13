import { readdir } from 'fs/promises';
import { DiscordApi } from './discord.js';
import { config } from 'dotenv';
import { APIApplicationCommand, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import sleep from './shared/sleep.js';
config();

if (process.env.DISCORD_TOKEN && process.env.CLIENT_ID && process.env.GUILD_IDS) {
	const api = new DiscordApi(process.env.DISCORD_TOKEN);
	const appId = process.env.CLIENT_ID;
	const guildIds = process.env.GUILD_IDS.split(',');
	const existingGuildCommands: { [guildId: string]: APIApplicationCommand[] } = {};
	for (const guildId of guildIds) {
		const response = await api.getGuildCommands(appId, guildId);
		existingGuildCommands[guildId] = response.data;
	}
	const globalCommands: APIApplicationCommand[] = await (await api.getGlobalCommands(appId)).data;
	const commandFiles = await readdir(new URL('commands/', import.meta.url));
	for (const fileName of commandFiles) {
		const file = fileName.endsWith('ts') ? fileName.replace('ts', 'js') : fileName;
		if (file.includes('.command.')) {
			const { command }: { command: RESTPostAPIApplicationCommandsJSONBody } = await import(
				new URL(`commands/${file}`, import.meta.url).toString()
			);
			if (file.includes('.guild.')) {
				for (const guildId of guildIds) {
					try {
						const response = await api.createGuildCommand(appId, guildId, command);
						if (response.status >= 200 && response.status < 300) {
							const data: APIApplicationCommand = response.data;
							// remove this command to figure out which commands to delete later
							existingGuildCommands[guildId].filter((value) => {
								return value.id !== data.id;
							});
							console.log(`Installed ${command.name} into the server with id ${guildId}`);
						} else {
							console.error('An error occurred installing the command');
							console.error(response);
						}
					} catch (exc: any) {
						console.error(JSON.stringify(exc.response.data));
					}
					await sleep(2000);
				}
			} else {
				const commandData: APIApplicationCommand = (await api.createGlobalCommand(appId, command)).data;
				globalCommands.filter((value) => value.id !== commandData.id);
				console.log(`Installed global command ${command.name}`);
			}
		}
	}
	for (const guildId of guildIds) {
		for (const command of existingGuildCommands[guildId]) {
			console.log(`Existing guild command ${command.name} will be removed from ${guildId}`);
		}
	}
	for (const command of globalCommands) {
		console.log(`Existing global command ${command.name} will be removed`);
	}
} else {
	throw new Error('DISCORD_TOKEN must be set before calling the install command');
}
