import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

interface OutputData {
  streamedOutput: string;
  fullOutputText: string;
}

export const runtime = "edge";

export const SendCodeData = async ({ input }: { input: string }) => {
  const response = await hf.textGenerationStream(
    //   for await (const output of hf.textGenerationStream(
    {
      model: "tiiuae/falcon-7b-instruct",
      // inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${input}`,
      inputs: input,
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

  // Convert the async generator into a readable stream
  const stream = HuggingFaceStream(response);

  // Return a StreamingTextResponse, enabling the client to consume the response
  return new StreamingTextResponse(stream);
};

// export const SendCodeData = async ({ input }: { input: string }) => {
//   //   setMessages((prev) => ({
//   //     ...prev,
//   //     user: [...prev.user, input],
//   //   }));
//   let streamedOutput;
//   let fullOutputText = "";
//   //   const outputData: OutputData = { streamedOutput, fullOutputText };
//   //   try {
//   // setLastOutput([]);
//   //   const response = await hf.textGenerationStream(
//   for await (const output of hf.textGenerationStream(
//     {
//       model: "tiiuae/falcon-7b-instruct",
//       // inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${input}`,
//       inputs: `${input}`,
//       parameters: {
//         max_new_tokens: 1024,
//         return_full_text: false,
//         // num_return_sequences: 2,
//         truncate: 1000,
//         top_k: 50,
//         repetition_penalty: 1.2,
//         top_p: 0.95,
//         temperature: 0.9,
//         do_sample: true,
//       },
//     },
//     {
//       use_cache: false,
//     }
//   )) {
//     console.log(output);
//     streamedOutput = output.token.text!;
//   }

//   const stream = HuggingFaceStream(streamedOutput as any);

//   console.log(stream);

//   // streamedOutput += [output.token.text];
//   // console.log(streamedOutput);
//   // streamedOutput += [output.token.text];
//   // console.log(outputData.streamedOutput);

//   //     // return outputData.streamedOutput;

//   //     // setCurrentOutput(output.token.text);
//   //     // setLastOutput((prevState) => [...prevState, ...outputData]);

//   //     // setOutput(output.token.text);
//   //   } else {
//   //     console.log(output.generated_text);
//   //     // outputData.fullOutputText += await output.generated_text!;
//   //     // setCurrentOutput(await output.generated_text!);
//   //     // console.log('Last token "generated_text":', output.generated_text);
//   //   }

//   // console.log(output);
//   //   } catch (error) {
//   //     console.log(error);
//   //   } finally {
//   // setMessages((prev) => ({
//   //   ...prev,
//   //   ai: [...prev.ai, currentOutput],
//   // }));

//   // finally {
//   //   for await (const output of hf.textGenerationStream(
//   //     {
//   //       // model: "google/flan-t5-xxl",
//   //       model: "tiiuae/falcon-7b-instruct",
//   //       // best input, generates actual questions
//   //       // inputs: `Generate 10 technical interview questions, about the code, based on this project: ${contentData}`,
//   //       // inputs: `Imagine that you are an interviewer and I'm the interviewee. Ask me questions about this code, as if you were interviewing me: ${contentData}`,
//   //       // inputs: `Ask me questions about this code, as if you were interviewing me: ${contentData}`,
//   //       // inputs: `Analyze the code at the end of this paragraph and ask me questions it, so you can better understand its functionality. For example, you can ask me what's the purpose of a specific function etc.: ${contentData}`,
//   //       // inputs: `Analyze the code at the end of this paragraph and generate 10 questions which I might get asked about its functionality or the overall project: ${mappedContent}`,
//   //       // inputs: `Analyze the code at the end of this paragraph and generate 10 questions which I might get asked about its functionality or the overall project. In addition to that, pick 2 functions and generate a question about them specifically: ${mappedContent}`,
//   //       parameters: {
//   //         max_new_tokens: 2500,
//   //         return_full_text: false,
//   //         truncate: 1000,
//   //         top_k: 50,
//   //         repetition_penalty: 1.2,
//   //         top_p: 0.95,
//   //         temperature: 0.9,
//   //       },
//   //     },
//   //     {
//   //       use_cache: false,
//   //     }
//   //   )) {
//   //     const outputData = [output.token.text];
//   //     setOutput((prevState) => [...prevState, ...outputData]);
//   //     console.log(output);
//   //   }
//   // }

//   //   return new StreamingTextResponse(stream);

//   return streamedOutput;
// };

export default SendCodeData;
