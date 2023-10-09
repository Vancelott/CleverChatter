import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function POST(req: Request) {
  const { prompt } = await req.json();

  let generatedText; // Declare a variable outside the loop
  const response = await hf.textGenerationStream(
    //   for await (const output of hf.textGenerationStream(
    {
      model: "tiiuae/falcon-7b-instruct",
      // inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${input}`,
      inputs: prompt,
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
  );
  //   {
  //     generatedText = output; // Assign output to the variable
  //   }

  // Convert the async generator into a readable stream
  const stream = HuggingFaceStream(response);

  // Return a StreamingTextResponse, enabling the client to consume the response
  return new StreamingTextResponse(stream);
}
