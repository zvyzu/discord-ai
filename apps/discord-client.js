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
    console.log(`Logged in as ${ client.user.tag }!`);
    client.user.setActivity(process.env.ACTIVITY, { type: ActivityType.Custom });
  });

  // Handle chat message pada channel yang sudah ditentukan
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith('!')) return;

    let conversationLog = [];

    try {
      await message.channel.sendTyping();

      let previousMessage = await message.channel.messages.fetch({ limit: 15 });
      previousMessage.reverse();

      previousMessage.forEach(async (msg) => {
        if (msg.content.startsWith('!')) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;

        if (msg.author.id == client.user.id) {
          conversationLog.push({
            role: "assistant",
            content: msg.content,
            name: msg.author.username
              .replace(/\s+/g, '_')
              .replace(/[^\w\s]/gi, ''),
          });
        }

        if (!message.author.bot) {
          conversationLog.push({
            role: 'user',
            content: msg.content,
            name: msg.author.username
              .replace(/\s+/g, '_')
              .replace(/[^\w\s]/gi, ''),
          });
        }

      });

      const array = splitTextIntoChunks(await chat(conversationLog));

      for (const i in array) {
        await message.reply(array[i]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  });

  // Handle interaksi slash command
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    async function sendMessagesSequentially(response) {
      const array = splitTextIntoChunks(await response);

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
          await interaction.deferReply();
          const targetUser = interaction.options.getUser("user") || interaction.user;
          const helloMessage = await chat(`Sapa ${targetUser}`);
          await interaction.editReply(
            `👋 ${helloMessage} ${targetUser} ${process.env.HELLO_MESSAGE}`,
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
            await chat(
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
            await analyze(
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