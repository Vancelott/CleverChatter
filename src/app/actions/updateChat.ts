"use server";

import { prisma } from "../libs/prismadb";

const UpdateChat = async (slug: string, cache: string) => {
  console.log("updateChat called");

  try {
    if (!slug) {
      console.error("Missing slug in UpdateChat.");
    }

    const updatedChat = await prisma.chat.update({
      where: {
        slug,
      },
      data: {
        cache,
      },
    });

    return updatedChat;
  } catch (error: any) {
    console.log("UpdateChat error:", error);
    return null;
  }
};

export default UpdateChat;
