import { PrismaClient, UserRole } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { HfInference } from "@huggingface/inference";

const prisma = new PrismaClient();

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userInput } = body;

    const sendData = async () => {
      try {
        for await (const output of hf.textGenerationStream(
          {
            model: "tiiuae/falcon-7b-instruct",
            inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${userInput}`,
            parameters: {
              max_new_tokens: 1024,
              return_full_text: false,
              // num_return_sequences: 2,
              truncate: 1000,
              top_k: 50,
              repetition_penalty: 1.2,
              top_p: 0.95,
              temperature: 0.9,
              do_sample: true,
            },
          },
          {
            use_cache: false,
          }
        ))

        const output2 = output.generated_text

      } catch (error) {
        console.log(error);
      }

      return output2
    };
  
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
