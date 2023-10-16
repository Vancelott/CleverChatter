// import prisma from "@/app/libs/prismadb";
import { useSession } from "next-auth/react";
import { prisma } from "../libs/prismadb";

export const GetMessages = async (chatSlug: string) => {
  const messages = await prisma.message.findUnique({
    where: {
      slug: chatSlug,
    },
    select: {
      userReq: true,
      aiRes: true,
    },
  });

  return messages;
};

export default GetMessages;
