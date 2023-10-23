"use client";

import GetMessages from "@/app/actions/getMessages";
import { useEffect, useState } from "react";
import { HfInference } from "@huggingface/inference";
import UpdateChat from "@/app/actions/updateChat";
import { MessagesData, CurrentMessages } from "../../types";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export default function Slug({ params }: { params: { slug: string } }) {
  const [chatSlug] = useState(params.slug);
  const [userMessages, setUserMessages] = useState<MessagesData[]>();
  const [aiMessages, setAiMessages] = useState<MessagesData[]>();

  const [userInput, setUserInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastOutput, setLastOutput] = useState<string[]>([""]);

  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });

  const [dbSortedMessages, setDbSortedMessages] = useState<any[]>();
  const [currentSortedMessages, setCurrentSortedMessages] = useState<any[]>();

  useEffect(() => {
    GetMessages(chatSlug).then((data) => {
      setUserMessages(data?.UserMessages), setAiMessages(data?.AiMessages);
    });
  }, [chatSlug]);

  const handleInputSubmit = async () => {
    setMessages((prev) => ({
      ...prev,
      user: [...prev.user, userInput],
    }));

    try {
      setCurrentOutput("");
      setLastOutput([]);
      for await (const output of hf.textGenerationStream(
        {
          model: "tiiuae/falcon-7b-instruct",
          inputs: userInput,
          parameters: {
            max_new_tokens: 1024,
            return_full_text: false,
            truncate: 1000,
            top_k: 50,
            repetition_penalty: 1.2,
            top_p: 0.95,
            temperature: 0.9,
          },
        },
        {
          use_cache: false,
        }
      ))
        if (output.token.text !== "<|endoftext|>") {
          const outputData = [output.token.text];

          setLastOutput((prevState) => [...prevState, ...outputData]);
        } else {
          setCurrentOutput(await output.generated_text!);
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, output.generated_text!],
          }));
        }
    } catch (error) {
      console.log(error);
    } finally {
      setUserInput("");
      setLastOutput([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await handleInputSubmit();
    } catch (error) {
      console.log("Error during submit:", error);
    } finally {
      UpdateChat(userInput, currentOutput, chatSlug);
    }
  };

  // sorts all of the available messages from the database by using the userMessage.id as index
  useEffect(() => {
    setDbSortedMessages([]);
    setDbSortedMessages(
      userMessages?.map(
        (userMessage: MessagesData, index = +userMessage.id) => (
          <div key={userMessage.id}>
            <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-2 whitespace-pre-wrap">
              {userMessage.messageContent}
            </p>
            <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl whitespace-pre-wrap">
              {/* {aiMessages![index].messageContent} */}
              {aiMessages &&
                aiMessages[index] &&
                aiMessages[index].messageContent}
            </p>
          </div>
        )
      )
    );
  }, [aiMessages, userMessages]);

  // sorts all of the messagse typed after getting the currently available messages in the database
  useEffect(() => {
    setCurrentSortedMessages([]);
    setCurrentSortedMessages(
      messages.user?.map((userMessage: string, index) => (
        <div key={index}>
          <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-2">
            {userMessage}
          </p>
          <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
            {messages.ai[index]
              ? messages.ai && messages.ai[index]
              : lastOutput}
          </p>
        </div>
      ))
    );
  }, [lastOutput, messages.ai, messages.user]);

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-6xl">
        <div className="flex justify-start flex-col">
          <div>{dbSortedMessages}</div>
          <div>{currentSortedMessages}</div>
        </div>
        <div className="relative flex flex-col">
          <button
            onClick={handleSubmit}
            className="absolute right-0 top-[3.9rem] bg-blue-2 text-white py-2 px-4 rounded-full mr-2 mt-2 z-10"
          >
            Submit
          </button>
          <textarea
            rows={4}
            name="comment"
            id="comment"
            placeholder="Send a message"
            // className="m-0 w-full resize-none border-0 bg-blue-0 py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:py-4 md:pr-12 pl-3 md:pl-4"

            className="w-full p-2 shadow-sm focus:ring-blue-3 z-15 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible"
            defaultValue={""}
            onChange={(e) => setUserInput(e.target.value)}
          />
          {/* <textarea
          className="w-96 h-36 my-8 text-black"
          onChange={(e) => setUserInput(e.target.value)}
        /> */}
        </div>
      </div>
    </>
  );
}
