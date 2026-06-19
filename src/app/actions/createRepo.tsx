"use server";

import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import updateRepo from "./updateRepo";

const CreateRepo = async (title: string, repoData: string[], slug: string) => {
  try {
    if (!repoData || !slug) {
      console.error("Missing repoData/slug in createRepo.");
    }

    const currentUser = await getCurrentUser();

    const isUniqueRepo = await prisma.repository.findFirst({
      where: {
        title,
      },
    });

    if (isUniqueRepo != null) {
      const updatedRepo = updateRepo(repoData, slug, isUniqueRepo.id);
      return updatedRepo;
    }

    const newRepo = await prisma.repository.create({
      data: {
        title: title,
        repoData: repoData,
        userId: currentUser!.id,
        chats: [slug],
      },
    });

    return newRepo;
  } catch (error: any) {
    console.log("createRepo error:", error);
    return null;
  }
};

export default CreateRepo;
