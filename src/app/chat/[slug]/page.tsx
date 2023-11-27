"use client";

import GetMessages from "@/app/actions/getMessages";
import { Suspense, useEffect, useState } from "react";
import { HfInference } from "@huggingface/inference";
import UpdateChat from "@/app/actions/updateChat";
import { MessagesData, CurrentMessages } from "../../types";
import GetTotalMessages from "@/app/actions/getTotalMessages";
import { useInView } from "react-intersection-observer";
import toast, { Toaster } from "react-hot-toast";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

interface SlugPageProps {
  params: { slug: string,   isCreator: boolean};
}

export default function Slug({ params }: SlugPageProps) {
  const { ref: myRef, inView: entryVisibility, entry } = useInView();

  const [chatSlug] = useState(params.slug);
  const [userMessages, setUserMessages] = useState<MessagesData[]>();
  const [aiMessages, setAiMessages] = useState<MessagesData[]>();

  const [userInput, setUserInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastOutput, setLastOutput] = useState<string[]>([""]);
  const [submit, setSubmit] = useState(false);
  const [isCreator, setIsCreator] = useState(params.isCreator);

  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });

  const [page, setPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState<number>(0);

  const [firstRun, setFirstRun] = useState(true);
  const [allMessagesFetched, setAllMessagesFetched] = useState(false);

  const pageSize = totalMessages / 2 ? 4 : 3;
  const totalPages = Math.ceil(totalMessages! / pageSize);

  useEffect(() => {
    GetTotalMessages(chatSlug).then((data) => {
      setTotalMessages(data);
    });
  }, [chatSlug]);

  const handleInputSubmit = async () => {
    setLastOutput([]);
    setMessages((prev) => ({
      ...prev,
      user: [...prev.user, userInput],
    }));
    try {
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
          wait_for_model: true,
        }
      ))
        if (output.token.text !== "<|endoftext|>") {
          const outputData = [output.token.text];

          setLastOutput((prevState) => [...prevState, ...outputData]);
        } else {
          if (output.generated_text) {
            setCurrentOutput(output.generated_text as string);
          }
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, output.generated_text!],
          }));
        }
    } catch (error) {
      console.log(error);
    } finally {
      setLastOutput([]);
    }

    return currentOutput;
  };

  const handleSubmit = async () => {
    if (userInput.length > 0 && submit === false) {
      setSubmit(true);
      try {
        await handleInputSubmit();
      } catch (error) {
        console.log("Error during submit:", error);
      } finally {
        setSubmit(false);
      }
    } else {
      toast.error("Please type in a message.");
    }
  };

  // runs once the full response from the ai is available - the last token
  useEffect(() => {
    if (currentOutput.length > 0) {
      UpdateChat(userInput, currentOutput, chatSlug);
      setCurrentOutput("");
      setUserInput("");
    }
  }, [chatSlug, currentOutput, userInput]);

  useEffect(() => {
    if (entryVisibility === true && firstRun) {
      GetMessages(chatSlug, page).then((data) => {
        setUserMessages((prev: MessagesData[] | undefined) => [
          ...(prev || []),
          ...data!.UserMessages,
        ]),
          setAiMessages((prev: MessagesData[] | undefined) => [
            ...(prev || []),
            ...data!.AiMessages,
          ]);
      });
      setPage((prev) => prev + 1);
      // window.scrollTo({
      //   top: document.documentElement.scrollHeight,
      //   behavior: "smooth",
      // });
      setFirstRun(false);
    }
  }, [chatSlug, entryVisibility, firstRun, page]);

  useEffect(() => {
    setTimeout(() => {
      if (
        entryVisibility === true &&
        firstRun === false &&
        allMessagesFetched === false
      ) {
        GetMessages(chatSlug, page).then((data) => {
          if (data) {
            setUserMessages((prev: MessagesData[] | undefined) => [
              ...(prev || []),
              ...data!.UserMessages,
            ]),
              setAiMessages((prev: MessagesData[] | undefined) => [
                ...(prev || []),
                ...data!.AiMessages,
              ]);
          } else {
            setAllMessagesFetched(true);
          }
        });
        if (prevPage + 1 !== totalPages) {
          setPage((prev) => {
            setPrevPage(prev);
            return prev + 1;
          });
        }
        // window.scrollTo({
        //   top: document.documentElement.scrollHeight,
        //   behavior: "smooth",
        // });
      }
    }, 1000);
  }, [
    allMessagesFetched,
    chatSlug,
    entryVisibility,
    firstRun,
    page,
    prevPage,
    totalPages,
  ]);

  return (
    <>
      <div className="w-full h-screen px-4 mx-auto flex flex-col justify-between max-w-5xl my-6">
        <div className="flex justify-start flex-col">
          <div ref={myRef}></div>
          <div className="flex flex-col">
            <div className="flex flex-col-reverse">
              <Suspense
                fallback={
                  <p className="font-bold text-2xl text-white">Loading....</p>
                }
              >
                {userMessages?.map(
                  (userMessage: MessagesData, index = +userMessage.id) => (
                    <div key={index}>
                      <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-6">
                        {userMessage.messageContent}
                      </p>
                      <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
                        <Suspense
                          fallback={
                            <p className="font-bold text-white">....</p>
                          }
                        >
                          {aiMessages &&
                            aiMessages[index] &&
                            aiMessages[index].messageContent}
                        </Suspense>
                      </p>
                    </div>
                  )
                )}
              </Suspense>
            </div>
            {/* {userMessages!?.length > 0 && */}
            <div className="flex flex-col">
              {messages.user?.map((userMessage: string, index) => (
                <div key={index}>
                  <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-6">
                    {userMessage}
                  </p>
                  <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
                    {messages.ai[index]
                      ? messages.ai && messages.ai[index]
                      : lastOutput}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="static mb-16">
            <div className="relative flex flex-col">
              <button
                onClick={() => {
                  submit ? null : handleSubmit();
                }}
                disabled={submit}
                className={`absolute right-0 top-[3.9rem] bg-blue-2 text-white py-2 px-4 rounded-full mr-2 mt-2 z-10 ${
                  submit || !isCreator
                    ? "opacity-90 bg-blue-4 cursor-not-allowed"
                    : ""
                }`}
              >
                Submit
              </button>
              <textarea
                rows={4}
                name="comment"
                id="comment"
                value={userInput}
                disabled={submit || !isCreator}
                placeholder="Send a message"
                className={`w-full p-2 shadow-sm focus:ring-blue-3 z-15 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible ${
                  submit || !isCreator
                    ? "bg-slate-200 opacity-80 cursor-not-allowed"
                    : ""
                }`}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
