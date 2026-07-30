"use server";

import { prisma } from "../libs/prismadb";

const GetCurrentChat = async (currentSlug: string) => {
  try {
    const currentChat = await prisma.chat.findUnique({
      where: {
        slug: currentSlug,
      },
    });

    if (!currentChat) {
      console.log("No currentChat found.");
      return null;
    }

    return currentChat;
  } catch (error: any) {
    console.log("Error in GetCurrentChat", error);
    return null;
  }
};

export default GetCurrentChat;
