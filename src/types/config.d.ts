type config = {
  locales: {
    LANG: string;
    TIMEZONE: string;
  };
  discord: {
    ACTIVITY: string;
    CLIENT_ID: string;
    CHANNEL_ID: string;
    DISCORD_TOKEN: string;
  };
  groq: {
    DEFAULT_MODEL: string;
    GROQ_API_KEY: string;
    GROQ_API_KEY_BACKUP: string;
    HELLO_MESSAGE: string;
    SYSTEM_PROMPT: string;
  };
}