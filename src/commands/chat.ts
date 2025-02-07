import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { chat, models } from "../app/groq";
import split from "../utils/splitTexts";
import config from "../utils/config";
import t from "../utils/i18n";

const modelList = await models();
const modelChoices = modelList.map((model) => ({ name: model, value: model }));

export default {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription(t("chat.description"))
    .addStringOption((option) => option
      .setName("prompt")
      .setDescription(t("chat.promptDescription"))
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName("models")
      .setDescription(t("chat.promptDescription"))
      .setRequired(false)
      .addChoices(modelChoices)
    ),
  cooldown: 2,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    await interaction.editReply(
      `${interaction.user} : ${interaction.options.getString("prompt")}`
    );

    if (interaction.channel && "send" in interaction.channel) {
      const model = interaction.options.getString("models");
      const response = await chat(
        interaction.options?.getString("prompt") as string,
        (model === null) ? config.groq.DEFAULT_MODEL : model
      );

      const chunks: Array<string> = split(response);
      if (chunks.length === 1) {
        interaction.followUp(chunks[0]);
      }
      else {
        for (const chunk of chunks) {
          interaction.channel.send(chunk);
        }
      }
    }
  }
};