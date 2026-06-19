"use server";

import { useSession } from "next-auth/react";
import { prisma } from "../libs/prismadb";
import GetTotalMessages from "./getTotalMessages";

const GetMessages = async (
  chatSlug: string,
  page: number,
  pageSize: number,
  totalPages: number,
) => {
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

  const currentPage = page;

  // const totalMessages = userMessagesCount + aiMessagesCount;
  // // const pageSize = totalMessages / 2 ? 4 : 3 && totalMessages === 2 ? 1 : 1;
  // const pageSize = totalMessages === 2 ? 1 : totalMessages / 2 ? 4 : 3;
  // const totalPages = Math.ceil(totalMessages / pageSize);

  if (!page) {
    console.log("Page is missing in getMessages");
  }

  const skipValue = (currentPage - 1) * pageSize + (currentPage === 1 ? 0 : 0);

  if (currentPage <= totalPages) {
    const messages = await prisma.conversation.findFirst({
      where: {
        slug: chatSlug,
      },
      select: {
        UserMessages: {
          // skip: (currentPage - 1) * pageSize,
          skip: skipValue,
          take: pageSize,
          // orderBy: {
          //   createdAt: "asc",
          // },
          orderBy: {
            id: "desc",
          },
        },
        AiMessages: {
          skip: skipValue,
          take: pageSize,
          // orderBy: {
          //   createdAt: "asc",
          // },
          orderBy: {
            id: "desc",
          },
        },
      },
      // take: pageSize,
    });

    // console.log("userMessagesCount:", userMessagesCount);
    // console.log("aimessage:", aiMessagesCount);
    await prisma.$disconnect();

    return messages;
  } else {
    console.log("All of the currently available messages have been fetched.");
    return null;
  }
};

export default GetMessages;
