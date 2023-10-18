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

    const updatedMessages = await prisma.message.update({
      where: {
        slug: chatSlug,
      },
      data: {
        userReq: {
          push: userInput,
        },
        aiRes: {
          push: aiOutput,
        },
      },
    });

    // console.log(updatedMessages);
    return updatedMessages;
  } catch (error: any) {
    return null;
  }
};

export default UpdateChat;
