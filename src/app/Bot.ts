import type { Client } from "discord.js";

export class Bot {
  public constructor(public readonly client: Client) {
    this.client.login(process.env.DISCORD_TOKEN);

    this.client.on("ready", () => {
      console.log(`${this.client.user?.username} ready!`);

      // this.registerSlashCommands();
    });

    this.client.on("warn", (info) => console.log(info));
    this.client.on("error", console.error);

    // this.onInteractionCreate();
  }
}