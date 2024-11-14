import { chat, analyze } from "./ai-models.js";
import { registerCommands } from "./register-commands.js";
import { Client, ActivityType, GatewayIntentBits, EmbedBuilder } from "discord.js";
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

  client.on('messageCreate', async (rules) => {
    if (rules.author.bot) return;
    if (rules.channel.id !== process.env.RULES_CHANNEL_ID) return;

    const embed = new EmbedBuilder()
      .setTitle('Selamat Datang di Strinova Cafe!')
      .setDescription('Senang banget kamu bergabung di sini, Strinova Cafe adalah tempat buat para Navigator Strinova berkumpul, ngobrol, dan bersenang-senang. Biar server kita tetap asik dan nyaman, kami berharap kalian dapat membaca beberapa aturan server Strinova Cafe')
      .addFields(
        {
          name: 'Note!',
          value: '```Bila ada suatu hal yang belum tertera pada rules dibawah, dimohon seluruh Navigator Strinova Cafe tetap dapat bertindak/bersikap sewajarnya```'
        },

        {
          name: '1. —  **Ikuti Terms and Service Komunitas Discord**',
          value: 'Kita berpegang pada Terms and Service Discord. Jadi, dimohon untuk seluruh Navigator Strinova Cafe dapat mengikuti peraturan Terms And Service Discord'
        },

        {
          name: '2. — **Hormati Sesama Player dan Bercanda Sewajarnya**',
          value: 'Semua di sini terbuka untuk bersikap ramah. Dimohon untuk dapat bersikap wajar ketika sedang berbincang antar sesama, jangan sampai melewati batas yang dapat menyinggung seseorang atau suatu kelompok'
        },

        {
          name: '3. — **No Konten NSFW!**',
          value: 'Server ini terbuka untuk segala umur (Berdasarkan ToS Discord), konten NSFW (Not Safe For Work) tidak diperbolehkan. Biar server tetap nyaman untuk semua orang!'
        },

        {
          name: '4. — **Hindari Spam dan Caps Lock Berlebihan**',
          value: 'Spam dalam bentuk apa pun, termasuk GIF, stiker, atau emoji yang berlebihan, yang dapat merusak obrolan. Begitu juga dengan CAPS LOCK yang berlebihan'
        },

        {
          name: '5. — **Konten Tidak Pantas dilarang keras! **',
          value: 'Konten yang mengandung pornografi, rasisme, atau bersifat SARA nggak diterima di sini. Kami hanya ingin server ini tetap jadi ruang aman untuk semua.'
        },

        {
          name: '6. —** Iklan Hanya di Tempatnya**',
          value: 'Mau berbagai link server, Youtube, atau yang lain? silahkan aja, tetapi pastikan postingnya dichannel yang khusus aja / sudah disediakan.'
        },

        {
          name: '7. — **Gunakan Channel Sesuai Fungsinya**',
          value: 'Setiap channel punya topik sendiri ya, jadi pastikan setiap obrolan harus sesuai dengan tempatnya. Dengan begitu, semuanya tetap rapi dan enak buat ngobrol.'
        },

        {
          name: '8. — **Dilarang Mengirim Program Berbahaya**',
          value: 'Demi keamanan Strinova Cafe, jangan pernah mengirim Malware, Adrawe, Logger, atau Program berbahaya lainnya disini!'
        },

        {
          name: '9. — **Hormati Tim Staff**',
          value: 'Staff mempunyai hak untuk mengambil tindakan yang sesuai atau kebijakan mereka sendiri terhadap setiap player yang melanggar salah satu peraturan yang disebutkan atau tidak disebutkan diatas.'
        },

        {
          name: '**Jika terjadi pelanggaran peraturan:**',
          value: 'Pelanggaran berulang (tiga kali atau lebih) bisa berujung pada kick atau ban permanen.'
        },

        {
          name: 'Note!',
          value: 'Peraturan ini akan langsung berlaku disaat anda sudah memasuki server Strinova Cafe. Terima kasih sudah jadi bagian dari komunitas ini, dan selamat bersenang-senang di Strinova Cafe!'
        },
      )
      .setFooter({ text: 'Peraturan ini mungkin akan diperbarui sewaktu-waktu.' })

    if (!rules.content.startsWith('!')) {
      await rules.channel.send({ files: ["./assets/img/BannerRule.png"] });
      await rules.channel.send({ embeds: [embed] });
    }

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