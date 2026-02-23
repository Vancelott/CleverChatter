"use client";

import React, { useEffect, useRef, useState } from "react";
import octokit from "../libs/octokit";
import ai from "../libs/gemini";
import { RepoList } from "./components/repoList";
import { Repository, CurrentMessages } from "../types";
import createChat from "../actions/createChat";
import UpdateChat from "../actions/updateChat";
import { useRouter } from "next/navigation";
import getCurrentUser from "../actions/getCurrentUser";
import GetRepoContent from "../actions/getRepoContent";
import Loading from "./loading";

export default function Chat() {
  const [data, setData] = useState<Repository[]>([]);

  const [submit, setSubmit] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  const [userInput, setUserInput] = useState<string>("");
  const [currentOutput, setCurrentOutput] = useState<string>("");
  // const [lastOutput, setLastOutput] = useState<string[]>([""]);
  const [lastOutput, setLastOutput] = useState<string>("");
  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });
  const [clickCount, setClickCount] = useState(0);
  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState("");
  const router = useRouter();

  const [selectedChildRepo, setSelectedChildRepo] = useState("");

  const getSelectedRepo = (name: string) => {
    const data = name;
    setSelectedChildRepo(data);
  };

  const firstUserPrompt = `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically.`;

  // creates chat once the full output from the ai is available
  useEffect(() => {
    if (clickCount === 0 && currentOutput.length > 1 && selectedChildRepo.length > 1) {
      createChat(firstUserPrompt, currentOutput, selectedChildRepo).then(
        (data) => (setChatSlug(data?.slug!), setClickCount((prevCount) => prevCount + 1)),
      );
      setCurrentOutput("");
      setUserInput("");
    }
  }, [currentOutput, clickCount, selectedChildRepo, firstUserPrompt]);

  useEffect(() => {
    if (chatSlug.length > 1) {
      router.push(`/chat/${[chatSlug]}`, { scroll: false });
    }
  }, [chatSlug, router]);

  useEffect(() => {
    if (currentOutput.length > 0 && clickCount >= 2) {
      UpdateChat(userInput, currentOutput, chatSlug);
      setCurrentOutput("");
      setUserInput("");
    }
  }, [chatSlug, clickCount, currentOutput, userInput]);

  useEffect(() => {
    const getUsername = async () => {
      const user = await getCurrentUser();
      setUsername(user?.username as string);
    };
    getUsername();
  });

  useEffect(() => {
    if (username) {
      const fetchRepoList = async () => {
        const { data: repoGetRequest } = await octokit.rest.repos.listForUser({
          username,
        });

        const repoList = await repoGetRequest;

        setData(repoList);
      };
      fetchRepoList();
    }
  }, [username]);

  const createFirstInput = (decodedContent: string[]) => {
    return `Answer my query in no more than 350 characters. ${firstUserPrompt} ${decodedContent}`;
  };

  const sendData = async (initialInput: string) => {
    let currentReply: string = "";

    if (clickCount === 0) {
      setMessages((prev) => ({
        ...prev,
        user: [...prev.user, firstUserPrompt],
      }));
    }
    try {
      setLastOutput("");
      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: initialInput,
      });

      // atobContent();
      for await (const chunk of response) {
        const text: string = chunk?.candidates?.[0]?.content?.parts?.[0]?.text!;
        currentReply = text;
        setLastOutput((prev) => prev + text);
      }
    } catch (error) {
      console.log(error);
    }
    setCurrentOutput(lastOutput);
    setMessages((prev) => ({
      ...prev,
      ai: [...prev.ai, currentReply],
    }));

    return currentOutput;
  };

  const handleInputSubmit = async () => {
    let currentReply: string = "";

    try {
      setLastOutput("");
      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: userInput,
      });

      // atobContent();
      for await (const chunk of response) {
        const text: string = chunk?.candidates?.[0]?.content?.parts?.[0]?.text!;
        currentReply = text;
        setLastOutput((prev) => prev + text);
      }
    } catch (error) {
      console.log(error);
    }
    setCurrentOutput(lastOutput);
    setMessages((prev) => ({
      user: [...prev.user, userInput],
      ai: [...prev.ai, currentReply],
    }));

    return currentOutput;
  };

  const handleRepoSubmit = async () => {
    try {
      setSubmit(true);
      setHideList(true);
      if (clickCount === 0) {
        const decodedContent = await GetRepoContent(
          `${username}`,
          `${selectedChildRepo}`,
          "",
        );
        const initialInput = await createFirstInput(decodedContent);
        // await setMappedContent(decodedContent);
        await sendData(initialInput);
        // const pathData = await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "");
        // const contentData2 = await fetchContent(
        //   `${username}`,
        //   `${selectedChildRepo}`,
        //   pathData,
        // );
        // const decodedContent = await decodeContent(contentData2);
      } else {
        await handleInputSubmit();
        setClickCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.log("Error during submit:", error);
    } finally {
      setSubmit(false);
    }
  };

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-5xl bottom-0">
        {!hideList && (
          <>
            <div className="flex flex-col justify-center items-center bg-blue-00 h-screen my-10 mx-auto relative py-32 z-10">
              <p className="font-extrabold text-5xl pb-4 whitespace-nowrap">
                Your repositories
              </p>
              <p className="font-semibold text-xl pb-4">
                Choose a repository to prepare on
              </p>
              <RepoList data={data} handleCallback={getSelectedRepo} />
              <button
                onClick={() => (selectedChildRepo ? handleRepoSubmit() : undefined)}
                disabled={!selectedChildRepo}
                className={`mt-10 bg-blue-2 px-3 py-3 rounded-xl text-white-1 font-medium text-xl hover:bg-blue-1 transition-bg-color duration-300 ${
                  !selectedChildRepo
                    ? "cursor-not-allowed bg-blue-1 opacity-70 text-gray-200"
                    : ""
                }`}
              >
                Submit
              </button>
            </div>
          </>
        )}
        {hideList && (
          <>
            <div className="w-full h-screen mx-auto flex flex-col justify-between max-w-5xl px-8 md:px-24 py-12">
              <div className="flex justify-start flex-col">
                {/* {messages.user.length === 0 && <Loading />} */}
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
              {messages.user.length > 0 && (
                <div className="static mb-16">
                  <div className="relative flex flex-col">
                    <button
                      onClick={() => {
                        submit ? null : handleInputSubmit();
                      }}
                      disabled={submit}
                      className={`absolute right-0 top-[3.9rem] bg-blue-2 text-white py-2 px-4 rounded-full mr-4 mt-2 z-10 ${
                        submit ? "opacity-90 bg-blue-4 cursor-not-allowed" : ""
                      }`}
                    >
                      Submit
                    </button>
                    <textarea
                      rows={4}
                      name="comment"
                      id="comment"
                      value={userInput}
                      disabled={submit}
                      placeholder="Send a message"
                      className={`w-full p-2 shadow-sm focus:ring-blue-3 pr-24 z-15 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible ${
                        submit ? "bg-slate-200 opacity-80 cursor-not-allowed" : ""
                      }`}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
