import { command as getCommand, handler as getHandler } from './get.guild.command.js';

export const command = { ...getCommand, name: 'ladder' };

export const handler = getHandler;
