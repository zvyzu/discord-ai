import Groq from "groq-sdk";
import { days } from "../utils/utils";

export default async function chat(prompt: string | messages[]): Promise<string | null> {
  const date = new Date();
  
  const messages: messages[] = [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: `${process.env.SYSTEM_PROMPT} (${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() } ${ process.env.TIMEZONE }; ${ days }, ${ date.getDate() }/${ date.getMonth() + 1 }/${ date.getFullYear() })`,
      },
    ];

  let apikey: string | undefined;
  if (typeof(prompt) === "object") {
    for (const message of prompt) {
      messages.push(message);
    }
    apikey = process.env.GROQ_API_KEY;
  } else if (typeof(prompt) === "string") {
    messages.push(
      {
        role: "user",
        content: prompt,
      },
    );
    apikey = process.env.GROQ_API_KEY_BACKUP;
  }

  const groq = new Groq({ apiKey: apikey });
  const response = await groq.chat.completions.create({
    // Required parameters
    messages: messages,
    // The language model which will generate the completion.
    model: "llama-3.3-70b-versatile",

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

  return response.choices[0]?.message?.content;
}
