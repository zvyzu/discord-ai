import type {
  ApplicationCommandDataResolvable,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  Snowflake
} from "discord.js";
import { Collection, Events, REST, Routes } from "discord.js";
import type { Command } from "../types/command";
import type { PermissionResult } from "../types/permission";
import { checkPermissions } from "../utils/checkPermissions";
import { MissingPermissionsException } from "../utils/MissingPermissionsException";
import config from "../utils/config";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import t from "../utils/i18n";

export class Bot {
  public readonly prefix = "/";
  public commands = new Collection<string, Command>();
  public slashCommands = new Array<ApplicationCommandDataResolvable>();
  public slashCommandsMap = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();

  public constructor(public readonly client: Client) {
    this.client.login(process.env.DISCORD_TOKEN);

    this.client.on("ready", () => {
      console.log(`${this.client.user?.username} ready!`);

      this.registerSlashCommands();
    });

    this.client.on("warn", (info) => console.log(info));
    this.client.on("error", console.error);

    this.onInteractionCreate();
  }

  private async registerSlashCommands() {
    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));
    for (const file of commandFiles) {
      const command = await import(join(__dirname, "..", "commands", `${file}`));

      this.slashCommands.push(command.default.data);
      this.slashCommandsMap.set(command.default.data.name, command.default);
    }

    try {
      const rest = new REST({ version: "9" }).setToken(config.discord.DISCORD_TOKEN);

      if (!this.client.user) {
        throw new Error("Client user is not initialized");
      }
      await rest.put(Routes.applicationCommands(this.client.user.id), { body: this.slashCommands });
      console.log("Successfully refreshed the application (/) command.");
    } catch (error) {
      console.error(error);
    }
  }

  private async onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.slashCommandsMap.get(interaction.commandName);

      if (!command) return;

      if (!this.cooldowns.has(interaction.commandName)) {
        this.cooldowns.set(interaction.commandName, new Collection());
      }

      const now = Date.now();
      let timestamps = this.cooldowns.get(interaction.commandName);
      if (!timestamps) {
        timestamps = new Collection<Snowflake, number>();
        this.cooldowns.set(interaction.commandName, timestamps);
      }
      const cooldownAmount = (command.cooldown || 1) * 1000;

      const timestamp = timestamps.get(interaction.user.id);

      if (timestamp) {
        const expirationTime = timestamp + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: t("common.cooldownMessage", {
              time: timeLeft.toFixed(1),
              name: interaction.commandName
            }),
            ephemeral: true
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        const permissionsCheck: PermissionResult = await checkPermissions(command, interaction);

        if (permissionsCheck.result) {
          command.execute(interaction as ChatInputCommandInteraction);
        } else {
          throw new MissingPermissionsException(permissionsCheck.missing);
        }
      } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error && error.message.includes("permissions")) {
          interaction.reply({ content: error.toString(), ephemeral: true }).catch(console.error);
        } else {
          interaction.reply({ content: t("common.errorCommand"), ephemeral: true }).catch(console.error);
        }
      }
    });
  }

}