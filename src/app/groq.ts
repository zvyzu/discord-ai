import Groq from "groq-sdk";
import date from "../utils/date";
import config from "../utils/config";

export async function models() {
  const speechModels = ['whisper-large-v3-turbo', 'distil-whisper-large-v3-en', 'whisper-large-v3']
  const visionModels = ['llama-3.2-90b-vision-preview', 'llama-3.2-11b-vision-preview']
  const groq = new Groq({ apiKey: config.groq.GROQ_API_KEY });
  const response = await groq.models.list();
  const data = response?.data;
  const models = [];

  for (const model of data) {
    models.push(model.id);
  }

  for (const model of models) {
    if (speechModels.includes(model)) {
      models.splice(models.indexOf(model), 1);
    }
    else if (visionModels.includes(model)) {
      models.splice(models.indexOf(model), 1);
    }
  }

  return models;
}

export async function chat(prompt: string | messages[], model = config.groq.DEFAULT_MODEL) {
  const messages: messages[] = [
    // Set an optional system message. This sets the behavior of the
    // assistant and can be used to provide specific instructions for
    // how it should behave throughout the conversation.
    {
      role: "system",
      content: `${config.groq.SYSTEM_PROMPT} (${date})`,
    },
  ];

  let apikey: string | undefined;
  if (typeof(prompt) === "object") {
    for (const message of prompt) {
      messages.push(message);
    }
    apikey = config.groq.GROQ_API_KEY;
  }
  else if (typeof(prompt) === "string") {
    messages.push(
      {
        role: "user",
        content: prompt,
      },
    );
    apikey = config.groq.GROQ_API_KEY_BACKUP;
  }

  try {
    const groq = new Groq({ apiKey: apikey });
    // @ts-ignore
    const response = await groq.chat.completions.create({
      // Required parameters
      messages: messages,
      // The language model which will generate the completion.
      model: model,

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

      // Groq API supports explicit reasoning formats through the reasoning_format parameter,
      // giving you fine-grained control over how the model's reasoning process is presented.
      // This is particularly valuable for valid JSON outputs, debugging,
      // and understanding the model's decision-making process.
      // Note: The format defaults to raw or parsed when JSON mode or tool use are enabled
      // as those modes do not support raw. If reasoning is explicitly set to raw with JSON mode
      // or tool use enabled, we will return a 400 error.
      // parsed :	Separates reasoning into a dedicated field while keeping the response concise.
      // raw    :	Includes reasoning within think tags in the content.
      // hidden :	Returns only the final answer for maximum efficiency.
      reasoning_format: "hidden"
    });

    return response.choices[0]?.message?.content as string;

  } catch (error) {
    console.error(error);
    return error as string;
  }
}
