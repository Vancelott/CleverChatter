import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const GetChatCreator = async (slug: string) => {
  try {
    const currentUser = await getCurrentUser();

    console.log("current slug in chatcreator:", slug);

    if (!currentUser) {
      console.log("No currentUser found in GetChatCreator.");
      return null;
    }

    const currentChatCreator = await prisma.chat.findMany({
      where: {
        userId: {
          equals: currentUser.id,
        },
        slug: {
          equals: slug,
        },
      },
    });

    if (!currentChatCreator) {
      console.log("No currentChatCreator found.");
      return false;
    }

    return true;
  } catch (error: any) {
    return null;
  }
};

export default GetChatCreator;
