"use server";

import { prisma } from "../libs/prismadb";

const UpdateChat = async (
  userInput: string,
  aiOutput: string,
  chatSlug: string
) => {
  try {
    if (!chatSlug) {
      console.log("Missing chat slug in updateChat.");
    }

    const userMessage = await prisma.userMessages.create({
      data: {
        messageContent: userInput,
        conversation: {
          connect: { slug: chatSlug },
        },
      },
    });

    const aiMessage = await prisma.aiMessages.create({
      data: {
        messageContent: aiOutput,
        conversation: {
          connect: { slug: chatSlug },
        },
      },
    });

    return [userMessage, aiMessage];
  } catch (error: any) {
    return null;
  }
};

export default UpdateChat;
