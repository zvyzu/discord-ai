import type { ChatInputCommandInteraction, Message } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import t from "../utils/i18n";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription(t("ping.description")),
  cooldown: 2,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: 'Pinging...' });
    const sent = await interaction.fetchReply() as Message;
    interaction.editReply(
      t("ping.result", {
        latency: sent.createdTimestamp - interaction.createdTimestamp,
        websocket: Math.round(interaction.client.ws.ping)
      }),
    );
  }
};