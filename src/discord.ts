import axios, { AxiosRequestConfig, type AxiosInstance } from 'axios';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

export class DiscordApi {
	#baseUrl = 'https://discord.com/api/v10';
	#token: string;
	#axios: AxiosInstance;
	constructor(token: string) {
		this.#token = token;
		this.#axios = axios.create({
			baseURL: this.#baseUrl,
			headers: DiscordApi.getHeaders(this.#token),
		});
	}

	static getHeaders(token: string) {
		return {
			Authorization: `Bot ${token}`,
			'Content-Type': 'application/json; charset=UTF-8',
			'User-Agent': 'DiscordBot (https://github.com/pxslip/leaderboard-bot, 1.0.0)',
		};
	}

	typeReplacer(key: string, value: unknown) {
		if (key === 'type' && typeof value === 'number') {
			return value.toString();
		}
		return value;
	}

	async #query(url: string, data: any = null, method: 'GET' | 'POST' | 'DELETE' = 'GET') {
		const request: AxiosRequestConfig = {
			url,
			method,
		};
		if (data) {
			request.data = data;
		}
		const response = await this.#axios.request(request);
		return response;
	}

	async getGuildCommands(appId: string, guildId: string) {
		return this.#query(`applications/${appId}/guilds/${guildId}/commands`);
	}

	async getGlobalCommands(appId: string) {
		return this.#query(`applications/${appId}/commands`);
	}

	async createGuildCommand(appId: string, guildId: string, command: RESTPostAPIApplicationCommandsJSONBody) {
		return this.#query(`applications/${appId}/guilds/${guildId}/commands`, command, 'POST');
	}

	async createGlobalCommand(appId: string, command: RESTPostAPIApplicationCommandsJSONBody) {
		return this.#query(`applications/${appId}/commands`, command, 'POST');
	}

	async deleteGuildCommand(appId: string, guildId: string, commandId: string) {
		return this.#query(`applications/${appId}/guilds/${guildId}/commands/${commandId}`, null, 'DELETE');
	}
}
