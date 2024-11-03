import Groq from "groq-sdk";
import { hari, bulan } from "../functions/utils.js";

/**
 * 
 * @param { string | object } prompt Pertanyaan yang ingin diajukan
 * @example await chat("Halo, apa kabar?")
 * @example 
 * let messages = [
 *   {
 *      role: "user",
 *      content: "Halo, apa kabar?",
 *      name: "username"
 *   },
 *   {
 *      role: "assistant",
 *      content: "Kabar baik, terima kasih. Ada yang bisa saya bantu?",
 *      name: "assistantname"
 *   },
 * ];
 * 
 * await chat(messages)
 * @returns { Promise<string> } Jawaban / Respon dari AI Model
 */
export async function chat(prompt) {
  const date = new Date();
  let parameters = {
    // Required parameters
    messages: [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: `${process.env.SYSTEM_PROMPT} (jam: ${date.getHours()}, menit: ${date.getMinutes()}, detik: ${date.getSeconds()} UTC+7, hari: ${hari()}, tanggal: ${date.getDate()} ${bulan()} ${date.getFullYear()})`,
      },
    ],
    // The language model which will generate the completion.
    model: "llama-3.2-90b-text-preview",

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
  }

  if (typeof(prompt) == "object") {
    prompt.forEach(msg => {
      parameters.messages.push(msg);
    });
  } else if (typeof(prompt) == "string") {
    parameters.messages.push(
      {
        role: "user",
        content: prompt,
      },
    );
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create(parameters);

  const ret = response.choices[0]?.message?.content;
  return ret;
}

/**
 * 
 * @param { string } image Base64 encoded image yang akan dianalisis
 * @param { string } prompt Pertanyaan yang ingin diajukan
 * @returns { Promise<string> } Jawaban / Respon dari AI Model
 */
export async function analyze(image, prompt) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    // Required parameters
    messages: [
      // Set a user message for the assistant to respond to.
      {
        role: "user",
        content: [
          {
            "type": "text",
            "text": prompt
          },
          {
            "type": "image_url",
            "image_url": {
              "url": image
            }
          },
        ]
      },
      {
        role: "assistant",
        content: ``,
      },
    ],
    // The language model which will generate the completion.
    model: "llama-3.2-90b-vision-preview",

    // Optional parameters

    // Controls randomness: lowering results in less random completions.
    // As the temperature approaches zero, the model will become deterministic
    // and repetitive.
    temperature: 0.85,

    // The maximum number of tokens to generate. Requests can use up to
    // 2048 tokens shared between prompt and completion.
    max_tokens: 1024,

    // Controls diversity via nucleus sampling: 0.5 means half of all
    // likelihood-weighted options are considered.
    top_p: 1,

    // If set, partial message deltas will be sent.
    stream: false,
  });

  const ret = response.choices[0]?.message?.content;
  return ret;
}