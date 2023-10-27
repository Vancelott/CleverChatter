"use server";

// import prisma from "@/app/libs/prismadb";
import { useSession } from "next-auth/react";
import { prisma } from "../libs/prismadb";

const GetTotalMessages = async (chatSlug: string) => {
  const conversationIdObject = await prisma.conversation.findFirst({
    where: {
      slug: chatSlug,
    },
    select: {
      id: true,
    },
  });

  const conversationId = conversationIdObject!.id;

  const userMessagesCount = await prisma.userMessages.count({
    where: {
      messageId: {
        equals: conversationId,
      },
    },
  });

  const aiMessagesCount = await prisma.aiMessages.count({
    where: {
      messageId: {
        equals: conversationId,
      },
    },
  });

  const totalMessages = userMessagesCount + aiMessagesCount;

  return totalMessages;
};

export default GetTotalMessages;
