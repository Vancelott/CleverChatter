"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const GetAllChats = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log("No currentUser found in GetAllChats.");
      return null;
    }

    const allChats = await prisma.chat.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    revalidatePath("/chat");

    return allChats;
  } catch (error: any) {
    console.log("Error in GetAllChats", error);

    return null;
  }
};

export default GetAllChats;
