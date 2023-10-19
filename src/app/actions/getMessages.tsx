"use server";

// import prisma from "@/app/libs/prismadb";
import { useSession } from "next-auth/react";
import { prisma } from "../libs/prismadb";

const GetMessages = async (chatSlug: string) => {
  const messages = await prisma.conversation.findFirst({
    where: {
      slug: chatSlug,
    },
    select: {
      UserMessages: true,
      AiMessages: true,
    },
  });

  console.log(messages);
  return messages;
};

export default GetMessages;
