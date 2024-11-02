import dotenv from "dotenv";
import { discordClient } from "./apps/discord-client.js";

async function main() {
  dotenv.config();
  discordClient();
}

main();
