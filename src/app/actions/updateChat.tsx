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

    if (userInput.length < 0) {
      console.log("User input is too short to create message entry.");
    }

    if (aiOutput.length < 0) {
      console.log("Ai output is too short to create message entry.");
    }

    // if (aiOutput.length > 0 && userInput.length > 0) {
    //   const userMessage = await prisma.userMessages.create({
    //     data: {
    //       messageContent: userInput,
    //       conversation: {
    //         connect: { slug: chatSlug },
    //       },
    //     },
    //   });

    //   const aiMessage = await prisma.aiMessages.create({
    //     data: {
    //       messageContent: aiOutput,
    //       conversation: {
    //         connect: { slug: chatSlug },
    //       },
    //     },
    //   });

    //   return [userMessage, aiMessage];
    // } else {
    //   console.log(
    //     "The user's input or the ai's output was too short to create an entry."
    //   );
    //   return null;
    // }

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

      console.log("messages created: ", userMessage, aiMessage);
      return [userMessage, aiMessage];
    }
  } catch (error: any) {
    return null;
  }
};

export default UpdateChat;
