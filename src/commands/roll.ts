import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import t from "../utils/i18n";

export default {
  data: new SlashCommandBuilder().setName("roll").setDescription(t("roll.description")).addIntegerOption((option) => option
    .setName(t("roll.side"))
    .setDescription(t("roll.sides"))
    .setRequired(false)
  ),
  cooldown: 2,
  execute(interaction: ChatInputCommandInteraction) {
    const sides = interaction.options.getInteger(t("roll.side")) || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    interaction.reply({ content: t("roll.result", { result: result, sides: sides }) });
  }
};