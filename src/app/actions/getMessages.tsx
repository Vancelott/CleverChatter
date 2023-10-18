// import prisma from "@/app/libs/prismadb";
import { useSession } from "next-auth/react";
import { prisma } from "../libs/prismadb";

export const GetMessages = async (chatSlug: string) => {
  const messages = await prisma.message.findFirst({
    where: {
      slug: chatSlug,
    },
    select: {
      userReq: true,
      aiRes: true,
    },
  });

  console.log(messages);
  return messages;
};

export default GetMessages;
