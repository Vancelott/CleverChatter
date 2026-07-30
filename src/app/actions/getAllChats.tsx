"use server";

import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const GetAllChats = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log("No currentUser found in GetAllChats.");
      await prisma.$disconnect();

      return null;
    }

    const allChats = await prisma.chat.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    await prisma.$disconnect();
    // return null;
    return allChats;
  } catch (error: any) {
    console.log("Error in GetAllChats", error);
    await prisma.$disconnect();

    return null;
  }
};

export default GetAllChats;
