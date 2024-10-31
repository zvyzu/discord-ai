import dotenv from "dotenv";
import Groq from "groq-sdk";
import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    ActivityType
} from "discord.js";

async function chat(prompt) {
    // Inisialisasi client Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
        // Required parameters
        messages: [
            // Set an optional system message. This sets the behavior of the
            // assistant and can be used to provide specific instructions for
            // how it should behave throughout the conversation.
            {
                role: "system",
                content: `${process.env.SYSTEM_PROMPT}`,
            },
            // Set a user message for the assistant to respond to.
            {
                role: "user",
                content: prompt,
            },
        ],
        // The language model which will generate the completion.
        model: "llama-3.2-90b-vision-preview",

        // Optional parameters

        // Controls randomness: lowering results in less random completions.
        // As the temperature approaches zero, the model will become deterministic
        // and repetitive.
        temperature: 0.8,

        // The maximum number of tokens to generate. Requests can use up to
        // 2048 tokens shared between prompt and completion.
        max_tokens: 1024,

        // Controls diversity via nucleus sampling: 0.5 means half of all
        // likelihood-weighted options are considered.
        top_p: 1,

        // A stop sequence is a predefined or user-specified text string that
        // signals an AI to stop generating content, ensuring its responses
        // remain focused and concise. Examples include punctuation marks and
        // markers like "[end]".
        stop: null,

        // If set, partial message deltas will be sent.
        stream: false,
    });

    const ret = response.choices[0]?.message?.content;
    return ret;
}

// Fungsi untuk memisahkan teks menjadi chunks
function splitTextIntoChunks(text) {
    const maxLength = 2000;
    const chunks = [];
    let currentChunk = '';

    // Split berdasarkan paragraf untuk menjaga konteks
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        // Jika paragraf tunggal lebih panjang dari maxLength
        if (paragraph.length > maxLength) {
            // Split berdasarkan kalimat
            const sentences = paragraph.split('. ');
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > maxLength) {
                    if (currentChunk) chunks.push(currentChunk.trim());
                    currentChunk = sentence + '. ';
                } else {
                    currentChunk += sentence + '. ';
                }
            }
        }
        // Jika menambahkan paragraf baru melebihi maxLength
        else if ((currentChunk + paragraph + '\n').length > maxLength) {
            chunks.push(currentChunk.trim());
            currentChunk = paragraph + '\n';
        } else {
            currentChunk += paragraph + '\n';
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    // Handle chunk terakhir
    // if (currentChunk) {
    //     // Jika ini chunk pertama dan satu-satunya
    //     if (chunks.length === 0) {
    //         chunks.push(currentChunk.trim() + '\n\n');
    //     } else {
    //         chunks.push(currentChunk.trim());
    //     }
    // }

    return chunks;
}

// Fungsi untuk mendaftarkan slash commands
async function registerCommands() {
    // Daftar command yang akan dibuat
    const commands = [
        new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Jawab dengan pong dan latency bot"),

        new SlashCommandBuilder()
            .setName("hello")
            .setDescription("Sapa user")
            .addUserOption((option) => option
                .setName("user")
                .setDescription("User yang ingin disapa")
                .setRequired(true),
            ),

        new SlashCommandBuilder()
            .setName("roll")
            .setDescription("Lempar dadu")
            .addIntegerOption((option) => option
                .setName("sides")
                .setDescription("Jumlah sisi dadu")
                .setRequired(true),
            ),

        new SlashCommandBuilder()
            .setName("chat")
            .setDescription("Chat dengan Kanami, AI Model Llama 3.2")
            .addStringOption((option) => option
                .setName("prompt")
                .setDescription("Pertanyaan yang ingin diajukan")
                .setRequired(true),
            ),
    ].map((command) => command.toJSON());

    // Mendaftarkan command ke Discord
    try {
        const rest = new REST({ version: "10" }).setToken(
            process.env.DISCORD_TOKEN,
        );

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
        });

        console.log("Berhasil me-refresh application (/) commands.");
    } catch (error) {
        console.error(error);
    }
}

async function discord() {
    // Inisialisasi client Discord
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
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
                    let response = splitTextIntoChunks(
                        await chat(
                            interaction.options.getString("prompt")
                        )
                    );
                    
                    for (let i in response) {
                        // console.log(response);
                        await interaction.channel.send(response[i]);
                        
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }

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

export async function main() {
    dotenv.config();
    discord();
}

main();
