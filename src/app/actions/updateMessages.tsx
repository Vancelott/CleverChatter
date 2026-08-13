"use server";

import { prisma } from "../libs/prismadb";

const UpdateMessages = async (userInput: string, aiOutput: string, chatSlug: string) => {
  console.log({
    userInput: userInput,
    aiOutput: aiOutput,
    chatSlug: chatSlug,
  });

  try {
    if (!chatSlug) {
      console.log("Missing chat slug in UpdateMessages.");
    }

    const userMessage = await prisma.userMessages.create({
      data: {
        messageContent: userInput,
        conversation: {
          connect: { slug: chatSlug },
        },
      },
    });

    if (userMessage) {
      const aiMessage = await prisma.aiMessages.create({
        data: {
          messageContent: aiOutput,
          conversation: {
            connect: { slug: chatSlug },
          },
        },
      });

      return [userMessage, aiMessage];
    }
  } catch (error: any) {
    return null;
  }
};

export default UpdateMessages;
