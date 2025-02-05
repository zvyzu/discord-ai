import { timezone } from './ipInfo';

let config: config;

try {
  config = require("../../config.json");
} catch (error) {
  config = {
        locales: {
            LANG: process.env.LANG || "en",
            TIMEZONE: process.env.TIMEZONE || timezone
        },
        discord: {
            ACTIVITY: "",
            CLIENT_ID: "",
            CHANNEL_ID: "",
            DISCORD_TOKEN: ""
        },
        groq: {
            GROQ_API_KEY: "",
            GROQ_API_KEY_BACKUP: "",
            HELLO_MESSAGE: "",
            SYSTEM_PROMPT: ""
        }
    } as const;
}

export default config;