import { chat, analyze } from "./ai-models.js";
import { registerCommands } from "./register-commands.js";
import { Client, ActivityType, GatewayIntentBits, } from "discord.js";
import { imageUrlToBase64, splitTextIntoChunks } from "../functions/utils.js";

/**
 * Discord Client
 */
export async function discordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.on("ready", () => {
    registerCommands();
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(process.env.ACTIVITY, { type: ActivityType.Custom });
  });

  // Handle interaksi slash command
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    async function sendMessagesSequentially(response) {
      let array = splitTextIntoChunks(await response);

      try {
        for (let i in array) {
          await interaction.channel.send(array[i]);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `Terjadi kesalahan saat menjalankan command! ${error}`,
          ephemeral: true,
        });
      }
    }

    const { commandName } = interaction;
    try {
      switch (commandName) {
        case "ping":
          const sent = await interaction.reply({
            content: "Pinging...",
            fetchReply: true,
          });
          const latency = sent.createdTimestamp - interaction.createdTimestamp;
          await interaction.editReply(
            `Pong! 🏓\nLatency: ${latency}ms\nWebsocket: ${client.ws.ping}ms`,
          );
          break;

        case "hello":
          const targetUser = interaction.options.getUser("user") || interaction.user;
          await interaction.reply(
            `👋 Halo ${targetUser}! Semoga harimu menyenangkan ${process.env.HELLO_MESSAGE}`,
          );
          break;

        case "roll":
          const sides = interaction.options.getInteger("sides") || 6;
          const result = Math.floor(Math.random() * sides) + 1;
          await interaction.reply(
            `🎲 Kamu mendapat angka ${result} dari ${sides}!`,
          );
          break;

        case "chat":
          await interaction.deferReply();
          await interaction.editReply(
            `${interaction.user} : ${interaction.options.getString("prompt")}`
          );

          sendMessagesSequentially(
            chat(
              interaction.options.getString("prompt")
            )
          );

          break;

        case "analyze":
          await interaction.deferReply();

          const attachment = interaction.options.getAttachment('image');

           // Validasi tipe file
          if (!attachment.contentType?.startsWith('image/')) {
            await interaction.editReply('Mohon upload file gambar yang valid (JPG, PNG, etc).');
            return;
          }

          await interaction.editReply({
            content: `${interaction.user} : ${interaction.options.getString("prompt")}`,
            files: [attachment] // Sertakan gambar asli dalam reply
          });

          // Convert image URL to base64
          const imageDataUrl = await imageUrlToBase64(attachment.url);

          sendMessagesSequentially(
            analyze(
              imageDataUrl,
              interaction.options.getString("prompt")
            )
          );

          break;
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Terjadi kesalahan saat menjalankan command!",
        ephemeral: true,
      });
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}