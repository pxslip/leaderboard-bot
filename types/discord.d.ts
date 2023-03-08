import { InteractionType } from 'discord-interactions';
import { ApplicationCommandOptionsType, ApplicationCommandType, ChannelTypes } from '../src/enums';

type snowflake = bigint | number;

export interface Member {
	[key: string]: unknown;
}

export interface User {
	[key: string]: unknown;
}

export interface Role {
	[key: string]: unknown;
}

export interface Channel {
	[key: string]: unknown;
}

export interface Message {
	[key: string]: unknown;
}

export interface Attachment {
	[key: string]: unknown;
}

export interface Command {
	command: ApplicationCommandDefinition;
	handler: (interaction: Interaction) => Promise<APIGatewayProxyResult>;
}

export interface ApplicationCommandDefinition {
	name: string;
	name_localizations?: Record<string, string>;
	type?: ApplicationCommandType;
	description?: string;
	description_localizations?: Record<string, string>;
	options: ApplicationCommandOption[];
	default_member_permissions?: string | number;
	dm_permission?: boolean;
	nsfw?: boolean;
}

export interface ApplicationCommandData extends ApplicationCommandDefinition {
	id: snowflake;
	application_id: string;
	guild_id?: snowflake;
	target_id?: snowflake;
}

export interface Interaction {
	id: snowflake;
	application_id: snowflake;
	type: InteractionType;
	data?: ApplicationCommandInteractionData; // TODO: Fill out the shape of this data
	guild_id?: snowflake;
	channel_id?: snowflake;
	member?: Member; // TODO: Fill out the shape of this data
	user?: User; // TODO: Fill out the shape of this data
	token: string;
	version: integer;
	message?: Message; // TODO: Fill out the shape of this data
	app_permissions?: string;
	locale?: string;
	guild_locale?: string;
}

export interface ApplicationCommandInteractionData {
	id: string;
	name: string;
	type: ApplicationCommandType;
	resolved?: {
		users?: Record<string, User>;
		members?: Record<string, Member>;
		roles?: Record<string, Role>;
		channels?: Record<string, Channel>;
		messages?: Record<string, Message>;
		attachments?: Record<string, Attachment>;
	}; // TODO: Fill out the shape of this data
	options?: { type: number; name: string; value: string }[]; // TODO: ditto above
	guild_id?: string;
	target_id?: string;
}

export interface ApplicationCommandOption {
	type: ApplicationCommandOptionsType;
	name: string;
	name_localizations?: Record<string, string>;
	description: string;
	description_localizations?: Record<string, string>;
	required?: boolean;
	choices?: { name: string; name_localizations?: Record<string, string>; value: string | number }[];
	options?: ApplicationCommandOption[];
	channel_types?: ChannelTypes[];
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
	autocomplete?: true;
	options?: ApplicationCommandOption;
}
