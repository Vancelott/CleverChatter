"use server";

import { prisma } from "../libs/prismadb";
import { revalidatePath } from "next/cache";

const DeleteChat = async (slug: string) => {
  try {
    if (!slug) {
      console.error("Missing slug in DeleteChat.");
      return null;
    }

    await prisma.chat.delete({
      where: {
        slug,
      },
    });

    revalidatePath("/chat");

    return true;
  } catch (error: any) {
    console.error(`DeleteChat error for slug: "${slug}": error`);
    return null;
  }
};

export default DeleteChat;
