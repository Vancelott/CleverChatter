import { CurrentMessages, IPrompt } from "../types";

type MessageRole = "user" | "model";

const initialPrompt = (prompt: string) => {
  return JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          response: {
            type: "ARRAY",
            items: { type: "STRING" },
            minItems: 3,
            maxItems: 5,
          },
          cache: {
            type: "OBJECT",
            properties: {
              questions: {
                type: "ARRAY",
                items: { type: "STRING" },
                minItems: 2,
                maxItems: 3,
              },
              summary: { type: "STRING" },
              snippets: {
                type: "ARRAY",
                items: { type: "STRING" },
                minItems: 1,
                maxItems: 2,
              },
            },
            required: ["questions", "summary", "snippets"],
          },
        },
        required: ["response", "cache"],
      },
      maxOutputTokens: 30000,
    },
  });
};

const createSystemInstructions = (cache: string) => {
  return {
    role: "user",
    parts: [
      {
        text: `You are an expert developer interviewer and your job is to ask interview questions based on provided code from a specific repository. Here is the cached summary of the project, as well as code snippets and additional questions: ${cache}. Use all of them to ask additional questions, in plain text, if requested to do so. The chat has to be about the user preparing for an interview for that same project, and you have to keep the conversation going in regards to it.`,
      },
    ],
  };
};

const newMessage = (msg: string, role: MessageRole) => {
  return {
    role: role,
    parts: [
      {
        text: msg,
      },
    ],
  };
};

export const createPrompt = async (
  messages: CurrentMessages,
  currentPrompt: string,
  cache: string,
  isInitial: boolean,
) => {
  if (isInitial) {
    return initialPrompt(currentPrompt);
  }

  let prompt: IPrompt = {
    systemInstruction: createSystemInstructions(cache),
    contents: [],
    generationConfig: {
      maxOutputTokens: 2000,
    },
  };
  for (let i = 0; i < messages.user.length; i++) {
    if (messages.user[i].length > 0) {
      prompt.contents.push(newMessage(messages.user[i], "user"));
    }
    if (messages.ai[i].length > 0) {
      prompt.contents.push(newMessage(messages.ai[i], "model"));
    }
  }
  prompt.contents.push(newMessage(currentPrompt, "user"));

  return JSON.stringify(prompt);
};
