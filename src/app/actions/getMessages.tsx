"use server";

import { prisma } from "../libs/prismadb";

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
          skip: skipValue,
          take: pageSize,
          orderBy: {
            id: "asc",
          },
          select: {
            messageContent: true,
          },
        },
        AiMessages: {
          skip: skipValue,
          take: pageSize,
          orderBy: {
            id: "asc",
          },
          select: {
            messageContent: true,
          },
        },
      },
    });

    return messages;
  } else {
    console.log("All of the currently available messages have been fetched.");
    // TODO consider returning { UserMessages: null, AiMessages: null };
    return null;
  }
};

export default GetMessages;
