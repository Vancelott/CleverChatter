"use server";

import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import getSession from "./getSession";

const CreateChat = async (userInput: string, aiOutput: string) => {
  try {
    const currentUser = await getCurrentUser();

    const newChat = await prisma.chat.create({
      data: {
        slug: "1234",
        title: "test-Title",
        user: {
          connect: { id: currentUser!.id },
        },
      },
    });

    console.log("userReq:", userInput, "aiRes:", aiOutput);

    const newMessage = await prisma.message.create({
      data: {
        slug: "1234",
        userReq: [userInput],
        aiRes: [aiOutput],
        chat: {
          connect: { id: newChat.id },
        },
      },
    });

    console.log(newChat);
    console.log(newMessage);
    return newChat;
  } catch (error: any) {
    return null;
  }
};

export default CreateChat;
