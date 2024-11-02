import { REST, Routes, SlashCommandBuilder } from "discord.js";

/**
 * Fungsi untuk mendaftarkan (/) commands ke Discord
 */
export async function registerCommands() {
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
          .setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName("roll")
      .setDescription("Lempar dadu")
      .addIntegerOption((option) => option
          .setName("sides")
          .setDescription("Jumlah sisi dadu")
          .setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName("chat")
      .setDescription("Chat dengan Kanami, AI Model Llama 3.2")
      .addStringOption((option) => option
          .setName("prompt")
          .setDescription("Pertanyaan yang ingin diajukan")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName('analyze')
      .setDescription('Analisis gambar yang diunggah')
      .addAttachmentOption(option => option
          .setName('image')
          .setDescription('Gambar yang akan dianalisis')
          .setRequired(true)
      )
      .addStringOption((option) => option
          .setName("prompt")
          .setDescription("Pertanyaan yang ingin diajukan")
          .setRequired(true)
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