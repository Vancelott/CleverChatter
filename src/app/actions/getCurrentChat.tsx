import { prisma } from "../libs/prismadb";

const GetCurrentChat = async (currentSlug: string) => {
  try {
    const currentChat = await prisma.chat.findUnique({
      where: {
        slug: currentSlug,
      },
    });

    if (!currentChat) {
      console.log("No currentChat found.");
      return null;
    }

    return currentChat;
  } catch (error: any) {
    return null;
  }
};

export default GetCurrentChat;
