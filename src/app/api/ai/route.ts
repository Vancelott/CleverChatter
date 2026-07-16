"use server";
import type { NextRequest } from "next/server";

const SendPrompt = async (request: NextRequest) => {
  const req = await request.json();

  const prompt = req;

  // TODO (not sure if it will be useful) move this call in a separate server action, and just call it here (or just use usage_metadata attribute from the response)
  // const countTokensResponse = await ai.models.countTokens({
  //   model: "gemini-2.0-flash",
  //   contents: req,
  // });

  //   if (countTokensResponse.totalTokens! > 1_048_576) {
  //   // flatsix without deflate 2044017
  //   console.log("Max input tokens reached");
  //   return;
  // }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
          "Content-Type": "application/json",
          // "Content-Type": "text/event-stream",
        },
        body: prompt,
        method: "POST",
      },
    );

    if (!response) {
      console.error("No response returned from the AI api route.");
      return new Response(
        JSON.stringify({
          error: {
            message: "The AI did not respond, please try again later.",
          },
        }),
      );
    }

    const reader = await response.body?.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (reader) {
          while (true) {
            let isError = false;
            let fullError = "";

            const { done, value } = await reader.read();
            if (done) break;
            let decode = decoder.decode(value, { stream: true });

            // if (decode.search(/"error"/) != -1) {
            if (decode.startsWith(`error`, 5)) {
              isError = true;
              fullError += decode;

              if (done) {
                const parsedData = JSON.parse(fullError);
                const returnedError = JSON.stringify({
                  error: {
                    message:
                      parsedData.error.code == 429
                        ? "The current quota for all models has been exceeeded, please retry later."
                        : "An error occurred, please try again later.",
                  },
                });

                console.error(decode);
                controller.enqueue(returnedError);
              }
              // continue the loop because the error response gets streamed in two parts, and the partial JSON can't get parsed
              continue;
            }

            // trims "data" and returns a json string
            const jsonString = decode.replace(/^data: /, "").trim();
            controller.enqueue(jsonString);
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    throw new Error(`${error}`);
  }
};
export { SendPrompt as POST };
