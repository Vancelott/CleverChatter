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
      responseJsonSchema: {
        text: {
          mimeType: "application/json",
          schema: {
            properties: {
              response: {
                description:
                  "This is the response to the last user message from the chat history",
              },
              cache: {
                descirption:
                  "Create a cache field to store 2 or 3 additional questions about the provided repo, and also store a short summary of the repo's contents, as well as 1 or 2 code snippets that you find interesting, which you can use to generate more questions in case the initial ones are already exhausted. The additional questions, summary and snippets should all be under `cache`",
              },
            },
            required: ["response", "cache"],
          },
        },
      },
      maxOutputTokens: 30000,
    },
  });
};
// role: "user",

const config = {
  systemInstruction: {
    role: "user",
    parts: [
      {
        text: "You are an expert developer interviewer and your job is to ask interview questions based on provided code from a specific github repository. If the repository content is no longer available within the chat history, there will be a short summary with a few backup questions that you can provide to the user in case you get prompted for additional questions. The chat has to be about the user preparing for an interview for that same project, and you have to keep the conversation going in regards to it.",
      },
    ],
  },
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

// TODO import the old/fetched messages (the schema will have to be updated to differentiate the user and model messages)
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
    // config: config,
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
  prompt.contents.push(newMessage(cache, "model"));
  prompt.contents.push(newMessage(currentPrompt, "user"));

  return JSON.stringify(prompt);
};
