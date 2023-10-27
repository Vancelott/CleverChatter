"use client";

import GetMessages from "@/app/actions/getMessages";
import { useEffect, useRef, useState } from "react";
import { HfInference } from "@huggingface/inference";
import UpdateChat from "@/app/actions/updateChat";
import { MessagesData, CurrentMessages } from "../../types";
import GetTotalMessages from "@/app/actions/getTotalMessages";
import { useInView } from "react-intersection-observer";
import toast, { Toaster } from "react-hot-toast";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export default function Slug({ params }: { params: { slug: string } }) {
  const { ref: myRef, inView: entryVisibility, entry } = useInView();

  const [chatSlug] = useState(params.slug);
  const [userMessages, setUserMessages] = useState<MessagesData[]>();
  const [aiMessages, setAiMessages] = useState<MessagesData[]>();

  const [userInput, setUserInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastOutput, setLastOutput] = useState<string[]>([""]);
  const [submit, setSubmit] = useState(false);

  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });

  const [page, setPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState<number>(0);

  const [dbSortedMessages, setDbSortedMessages] = useState<any[]>();
  const [currentSortedMessages, setCurrentSortedMessages] = useState<any[]>();

  const pageSize = 3;
  const totalPages = Math.ceil(totalMessages! / 2 / pageSize);
  const maxPage = Math.min(totalPages, Math.max(page + 5, 10));

  useEffect(() => {
    GetTotalMessages(chatSlug).then((data) => {
      setTotalMessages(data);
    });
  }, [chatSlug, page, totalPages]);

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
    if (userInput.length > 0) {
      setSubmit(true);
      try {
        await handleInputSubmit();
      } catch (error) {
        console.log("Error during submit:", error);
      } finally {
        UpdateChat(userInput, currentOutput, chatSlug);
        setSubmit(false);
      }
    } else {
      toast.error("Please type in a message.");
    }
  };

  useEffect(() => {
    const mergedUserMessages = userMessages ?? [];
    const mergedAiMessages = aiMessages ?? [];

    // Merge the two arrays
    const allMessages: MessagesData[] = [
      ...mergedUserMessages,
      ...mergedAiMessages,
    ];

    const sortedMessages = allMessages.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const renderedMessages = sortedMessages.map(
      (message, index = +message.id) => (
        <div key={message.id}>
          <p
            className={`px-4 py-6 text-white rounded-3xl my-2 whitespace-pre-wrap ${
              index % 2 ? "bg-blue-0" : "bg-blue-1"
            }`}
          >
            {message.messageContent} - {`${message.createdAt}`}
          </p>
        </div>
      )
    );

    // Render the sorted and mapped messages
    setDbSortedMessages((prev) => [prev, renderedMessages]);
  }, [userMessages, aiMessages]);

  // sorts all of the messagse typed after getting the currently available messages in the database
  useEffect(() => {
    if (messages.ai.length && messages.user.length > 1) {
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
    }
  }, [lastOutput, messages.ai, messages.user]);

  useEffect(() => {
    console.log("page:", page);
    console.log("totalPages:", totalPages);
  }, [page, totalPages]);

  // useEffect(() => {
  //   const observer = new IntersectionObserver((entries) => {
  //     const entry = entries[0];
  //     setEntryVisibility(entry.isIntersecting);
  //     if (entryVisibility === true && page <= maxPage) {
  //       setTimeout(() => {
  //         GetMessages(chatSlug, page).then((data) => {
  //           // setUserMessages((prev) => [data?.UserMessages, ...prev]);
  //           setUserMessages((prev: MessagesData[] | undefined) => [
  //             ...data!.UserMessages,
  //             ...(prev || []),
  //           ]),
  //             setAiMessages((prev: MessagesData[] | undefined) => [
  //               ...data!.AiMessages,
  //               ...(prev || []),
  //             ]);
  //           setPage((prev) => prev + 1);
  //         });
  //       }, 2000);
  //       // console.log("entry:", entry);
  //     }
  //   });
  //   observer.observe(myRef.current!);
  //   console.log("entryvisibility:", entryVisibility);

  //   console.log("page:", page);
  // }, [chatSlug, entryVisibility, page, maxPage]);

  useEffect(() => {
    // if (page && page === 1) {
    //   window.scrollTo({
    //     top: document.documentElement.scrollHeight,
    //     behavior: "smooth",
    //   });
    //   setPage((prev) => prev + 1);
    // }
    if (entryVisibility === true && page <= totalPages) {
      console.log("Current page:", page);

      GetMessages(chatSlug, page).then((data) => {
        // setUserMessages((prev) => [data?.UserMessages, ...prev]);
        setUserMessages((prev: MessagesData[] | undefined) => [
          ...(prev || []),
          ...data!.UserMessages,
        ]),
          setAiMessages((prev: MessagesData[] | undefined) => [
            // ...data!.AiMessages,
            // ...(prev || []),
            ...(prev || []),
            ...data!.AiMessages,
          ]);
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
        setPage((prev) => prev + 1);
      });
      // console.log("entry:", entry);
    }
  }, [chatSlug, entryVisibility, page, totalPages]);

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    console.log("entryVisibility", entryVisibility);
  }, [entryVisibility]);

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-6xl">
        <div className="flex justify-start flex-col max-h-5xl">
          <div ref={myRef}></div>
          {/* <div ref={myRef}>{dbSortedMessages && dbSortedMessages[0]}</div>
          <div>{dbSortedMessages && dbSortedMessages.slice(1, -1)}</div> */}
          <div>{dbSortedMessages}</div>
          <div>{currentSortedMessages}</div>
        </div>
        <div className="relative flex flex-col">
          <button
            onClick={handleSubmit}
            disabled={submit}
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
