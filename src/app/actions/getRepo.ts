"use server";

import { prisma } from "../libs/prismadb";

const GetRepo = async (title?: string, slug?: string) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: {
        OR: [
          {
            title,
          },
          {
            chats: { has: slug ? slug : null },
          },
        ],
      },
    });

    if (repo == null) {
      return null;
    }

    return repo;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export default GetRepo;
