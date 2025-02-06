import type { SlashCommandBuilder } from "discord.js";

type Command = {
  permissions?: string[];
  cooldown?: number;
  data: SlashCommandBuilder;
  execute(...args: unknown): unknown;
}