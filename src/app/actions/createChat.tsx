"use server";

import { prisma } from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import getSession from "./getSession";
import slugify from "slugify";

const CreateChat = async (
  userInput: string,
  aiOutput: string,
  repo: string
) => {
  try {
    if (!userInput || !aiOutput) {
      console.error("Missing userInput/ aiOutput in createChat.");
    }

    const currentUser = await getCurrentUser();

    const title = aiOutput.substring(1, 30);

    const slugifiedTitle = slugify(title, {
      strict: true,
      lower: true,
    });

    const createSlug = async () => {
      let id = 0;
      let isUnique = false;

      let slug = `${slugifiedTitle}` + `${id}`;

      while (!isUnique) {
        const uniqueChat = await prisma.chat.findFirst({
          where: {
            slug,
          },
        });

        if (!uniqueChat) {
          isUnique = true;
        } else {
          id++;
          slug = `${title}` + `${id}`;
        }
      }

      return slug;
    };

    const generatedSlug = await createSlug();

    const newChat = await prisma.chat.create({
      data: {
        slug: generatedSlug,
        title: title,
        repository: repo,
        user: {
          connect: { id: currentUser!.id },
        },
      },
    });

    const newMessage = await prisma.message.create({
      data: {
        slug: generatedSlug,
        userReq: [userInput],
        aiRes: [aiOutput],
        chat: {
          connect: { id: newChat.id },
        },
      },
    });

    console.log(newChat);
    console.log(newMessage);
    return newChat;
  } catch (error: any) {
    console.log("createChat error:", error);
    return null;
  }
};

export default CreateChat;
