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
      ACTIVITY: process.env.ACTIVITY || "",
      USER_ID: process.env.USER_ID || "",
      CHANNEL_ID: process.env.CHANNEL_ID || "",
      TOKEN: process.env.TOKEN || ""
    },
    groq: {
      DEFAULT_MODEL: process.env.DEFAULT_MODEL || "llama-3.3-70b-versatile",
      GROQ_API_KEY: process.env.GROQ_API_KEY || "",
      GROQ_API_KEY_BACKUP: process.env.GROQ_API_KEY_BACKUP || "",
      HELLO_MESSAGE: process.env.HELLO_MESSAGE || "",
      SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || ""
    }
  } as const;
}

export default config;