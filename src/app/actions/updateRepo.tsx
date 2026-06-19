"use server";

import { prisma } from "../libs/prismadb";

const UpdateRepo = async (repoData: string[], slug: string, id: string) => {
  try {
    const updatedRepo = await prisma.repository.update({
      where: {
        id: id,
      },
      data: {
        repoData,
        updatedAt: new Date().toISOString(),
        chats: {
          push: slug,
        },
      },
    });

    return updatedRepo;
  } catch (error: any) {
    console.log("updateRepo error:", error);
    return null;
  }
};

export default UpdateRepo;
