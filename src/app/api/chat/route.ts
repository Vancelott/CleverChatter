import { PrismaClient, UserRole } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userInput } = body;


    let errorMessage = "";
    let errorPassword = "";
    let errorEmail = "";
    let errorUsername = "";

    if (
      errorPassword.length > 0 ||
      errorMessage.length > 0 ||
      errorEmail.length > 0 ||
      errorUsername.length > 0
    ) {
      return await NextResponse.json(
        {
          error: errorMessage,
          data: {
            password: errorPassword,
            email: errorEmail,
            name: errorUsername,
          },
        },
        { status: 400 }
      );
    }


      const message = await prisma?.message.create({
        data: {
            userReq = userInput,
            aiRes = ,
            chatId =
        },

      return NextResponse.json(message);
    }
  } catch (error) {
    console.log(error);
    return NextResponse.error;
  }
}
