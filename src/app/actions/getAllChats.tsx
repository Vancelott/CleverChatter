"use server";

import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const GetAllChats = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log("No currentUser found.");
      return null;
    }

    const allChats = await prisma.chat.findMany({
      where: {
        userId: {
          equals: currentUser.id,
        },
      },
      take: 10,
    });

    // console.log(allChats);
    return allChats;
  } catch (error: any) {
    return null;
  }
};

export default GetAllChats;
