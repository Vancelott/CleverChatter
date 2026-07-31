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
  const skipValue = (page - 1) * pageSize + (page === 1 ? 0 : 0);

  if (page <= totalPages) {
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
          select: {
            messageContent: true,
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
          select: {
            messageContent: true,
          },
        },
      },
      // take: pageSize,
    });

    return messages;
  } else {
    console.log("All of the currently available messages have been fetched.");
    return null;
  }
};

export default GetMessages;
