import type { ChatInputCommandInteraction, PermissionResolvable } from "discord.js";
import type { Command } from "../types/command";
import type { PermissionResult } from "../types/permission";

export async function checkPermissions(command: Command, interaction: ChatInputCommandInteraction): Promise<PermissionResult> {
  if (!interaction.guild) {
    throw new Error("Guild not found in interaction");
  }
  if (!interaction.client.user) {
    throw new Error("Bot user not found in client");
  }
  const member = await interaction.guild.members.fetch({ user: interaction.client.user.id });
  const requiredPermissions = command.permissions as PermissionResolvable[];

  if (!command.permissions) return { result: true, missing: [] };

  const missing = member.permissions.missing(requiredPermissions);

  return { result: Boolean(!missing.length), missing };
}