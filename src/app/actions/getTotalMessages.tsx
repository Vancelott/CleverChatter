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

  // if (!conversationIdObject!.id) {
  //   console.log("Conversation id missing in getTotalMessages.");
  // }

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
  // const pageSize = totalMessages / 2 ? 4 : 3;
  // const totalPages = Math.ceil(totalMessages / pageSize);

  // console.log("userMessagesCount", userMessagesCount);
  // console.log("aiMessagesCount", aiMessagesCount);

  // console.log(
  //   "totalMessages, pageSize, totalPages:",
  //   totalMessages,
  //   pageSize,
  //   totalPages
  // );
  // console.log("totalPages:", totalPages);

  // return { totalMessages, pageSize, totalPages };

  console.log(totalMessages);

  return totalMessages;
};

export default GetTotalMessages;
