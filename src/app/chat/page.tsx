"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import octokit from "../libs/octokit";
import { RepoList } from "./components/repoList";
import { Repository, CurrentMessages, IPrompt } from "../types";
import createChat from "../actions/createChat";
import UpdateMessages from "../actions/updateMessages";
import { useRouter } from "next/navigation";
import getCurrentUser from "../actions/getCurrentUser";
import GetRepoContent from "../actions/getRepoContent";
import Loading from "./loading";
import toast, { Toaster } from "react-hot-toast";
import GetRepo from "../actions/getRepo";
import CreateRepo from "../actions/createRepo";
// import { JSONParser } from "@streamparser/json-whatwg";
import { JSONParser } from "@streamparser/json";
import UpdateChat from "../actions/updateChat";
import { createPrompt } from "../libs/helpers";

export default function Chat() {
  const [repos, setRepos] = useState<Repository[]>([]);

  const [submit, setSubmit] = useState(false);
  const [username, setUsername] = useState("");

  const [userInput, setUserInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastOutput, setLastOutput] = useState("");
  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });
  const [clickCount, setClickCount] = useState(0);
  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState("");
  const [cache, setCache] = useState("");
  const router = useRouter();

  const [selectedChildRepo, setSelectedChildRepo] = useState("");
  const [repoData, setRepoData] = useState<string[]>([]);

  const getSelectedRepo = (name: string) => {
    const data = name;
    setSelectedChildRepo(data);
  };

  const firstUserPrompt = `Generate 3-5 one line questions in bullet points that I might get asked in a coding related job interview. Respond in JSON, and create a "cache" to store 2 to 3 additional short questions about the provided repo, and a short summary of the repo's contents, as well as 1 or 2 code snippets that you find interesting, which you can use to generate more questions in case the initial ones are already exhausted. The response has to be in valid JSON format, with only a response and cache as parents.`;

  // The response must not use the backtick character - U+0060 or 0x60`;

  // creates chat once the full output from the ai is available
  useEffect(() => {
    if (clickCount === 0 && currentOutput.length > 1 && selectedChildRepo.length > 1) {
      const create = async () => {
        let slug;
        const chat = await createChat(firstUserPrompt, currentOutput, selectedChildRepo);
        slug = chat?.slug!;

        // TODO call updateRepo instead, to add the slug directly?
        const repo = await CreateRepo(selectedChildRepo, repoData, slug!);

        setChatSlug(chat?.slug!);
        setClickCount((prevCount) => prevCount + 1);

        await UpdateChat(slug, cache);
      };
      setCurrentOutput("");
      setUserInput("");
      create();
    }
    return () => {};
  }, [
    currentOutput,
    clickCount,
    selectedChildRepo,
    firstUserPrompt,
    repoData,
    chatSlug,
    cache,
  ]);

  useEffect(() => {
    if (chatSlug.length > 1) {
      router.push(`/chat/${[chatSlug]}`, { scroll: false });
    }
  }, [chatSlug, router]);
  // }, [chatSlug, messages.ai.length, messages.user.length, repoData.length, router]);

  useEffect(() => {
    if (currentOutput.length > 0 && clickCount >= 2) {
      UpdateMessages(userInput, currentOutput, chatSlug);
      setCurrentOutput("");
      setUserInput("");
    }
  }, [cache, chatSlug, clickCount, currentOutput, userInput]);

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

        setRepos(repoList);
      };
      fetchRepoList();
    }
  }, [username]);

  const createFirstInput = (decodedContent: string[]) => {
    // return `Answer the following in 200 words or less: ${firstUserPrompt} """${decodedContent}""" `;
    return `Answer the following in 200 words or less: ${firstUserPrompt}. The questions have to be specific for the code attached after this sentence: """${decodedContent}""" `;
  };

  // const handleInputSubmit = async (initialInput?: IPrompt) => {
  const handleInputSubmit = async (initialInput: string) => {
    let currentReply = "";
    let currentCache = "";
    let err = false;
    let isInitial = clickCount == 0;

    setLastOutput("");

    const prompt = await createPrompt(messages, initialInput, cache, isInitial);

    const response = await fetch("/api/ai", {
      method: "POST",
      // body: JSON.stringify(initialInput ? initialInput : userInput),
      body: JSON.stringify(prompt),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const jsonParser = new JSONParser({ paths: ["$.response.*"] });
    const cacheParser = new JSONParser({ paths: ["$.cache.*"] });

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // const decodedData = decoder.decode(value, { stream: true });
        const decodedData = new TextDecoder().decode(value);
        const parsedData = JSON.parse(decodedData);
        if (parsedData.error) {
          err = true;
          setLastOutput((prev) => (prev += parsedData.error.message));
          currentReply += parsedData.error.message;
          toast.error(currentReply);
          break;
        } else {
          let text = parsedData.candidates?.[0]?.content?.parts?.[0]?.text!;
          // TODO maybe use jsonParser.write(JSON.stringify(text)) instead? This might not be necessary if the schema is improved.
          text = text.replace("```json", "").replace("```", "").replace("`", "");

          jsonParser.onValue = ({ value, key, parent, stack }) => {
            // TODO the model sometimes responds with the questions in separate objects
            currentReply += value;
          };

          cacheParser.onValue = ({ value, key, parent, stack }) => {
            if (typeof value === "object" && !Array.isArray(value) && value !== null) {
              currentCache += JSON.stringify(value);
              return;
            } else if (Array.isArray(value)) {
              const objects = value.map((obj) => JSON.stringify(obj));
              currentCache += objects;
              return;
            }
            currentCache += value;
          };

          jsonParser.write(text);
          cacheParser.write(text);

          // setLastOutput((prev) => (prev += currentReply));
          setLastOutput(() => currentReply);
          // currentReply = "";
          if (!done) continue;
        }
      }
    }

    if (!err) setCurrentOutput(currentReply);
    setMessages((prev) => ({
      ...prev,
      ai: [...prev.ai, currentReply],
    }));
    setCache(JSON.stringify(currentCache));

    return currentOutput;
  };

  const handleRepoFetch = async () => {
    const repo = await GetRepo(selectedChildRepo);

    const repoContent =
      repo && repo.repoData
        ? repo.repoData
        : await GetRepoContent(`${username}`, `${selectedChildRepo}`, "");

    setRepoData(repoContent);
    return repoContent;
  };

  const handleRepoSubmit = async () => {
    try {
      setSubmit(true);
      setHideList(true);
      if (clickCount === 0) {
        setMessages((prev) => ({
          ...prev,
          user: [...prev.user, firstUserPrompt],
        }));

        const repoContent = repoData.length > 0 ? repoData : await handleRepoFetch();

        // const repoContent = await GetRepoContent(
        //   `${username}`,
        //   `${selectedChildRepo}`,
        //   "",
        // );

        // TODO use createPrompt here?
        const initialInput = await createFirstInput(repoContent);

        repoData.length <= 0 ? setRepoData(() => repoContent) : null;
        await handleInputSubmit(initialInput);
      } else {
        setMessages((prev) => ({
          ...prev,
          user: [...prev.user, userInput],
        }));
        await handleInputSubmit(userInput);
        setClickCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error(error);
      setSubmit(false);
      setHideList(false);
      setUserInput("");
      setMessages((prev) => ({
        ...prev,
        user: prev.user.filter((msg) => msg == userInput),
      }));

      console.error(error);
      toast.error("The repository data could not be fetched. Please try again.");
    } finally {
      setSubmit(false);
    }
  };

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-5xl bottom-0">
        {!hideList && (
          <>
            <Suspense fallback={<Loading />}>
              <div className="flex flex-col justify-center items-center bg-blue-00 h-screen my-10 mx-auto relative py-32 z-10">
                <p className="font-extrabold text-5xl pb-4 whitespace-nowrap">
                  Your repositories
                </p>
                <p className="font-semibold text-xl pb-4">
                  Choose a repository to prepare on
                </p>
                <RepoList data={repos} handleCallback={setSelectedChildRepo} />
                <button
                  onClick={() => (selectedChildRepo ? handleRepoSubmit() : undefined)}
                  disabled={!selectedChildRepo}
                  className="mt-10 bg-blue-2 px-3 py-3 rounded-xl text-white-1 font-medium text-xl hover:bg-blue-1 transition-bg-color duration-300 text-gray-200
                    disabled:hover:cursor-not-allowed disabled:bg-blue-1 disabled:opacity-70"
                >
                  Submit
                </button>
              </div>
            </Suspense>
          </>
        )}
        {hideList && (
          <>
            <Suspense fallback={<Loading />}>
              <div className="w-full h-screen mx-auto flex flex-col justify-between max-w-5xl px-8 md:px-24 py-12">
                <div className="flex justify-start flex-col">
                  {messages.user.length === 0 && <Loading />}
                  {messages.user?.map((userMessage: string, index) => (
                    <div key={index}>
                      <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-6">
                        {userMessage}
                      </p>
                      <div className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
                        {messages.ai[index] ? (
                          messages.ai[index]
                        ) : lastOutput.length > 0 ? (
                          lastOutput
                        ) : (
                          <Loading />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {(selectedChildRepo || messages.ai.length > 0) && (
                  <div className="static mb-16">
                    <div className="relative flex flex-col">
                      <button
                        onClick={() => {
                          submit ? null : handleInputSubmit(userInput);
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
                        className="w-full p-2 shadow-sm focus:ring-blue-3 pr-24 z-15 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible disabled:bg-slate-200 disabled:opacity-80 disabled:hover:cursor-not-allowed"
                        onChange={(e) => setUserInput(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Suspense>
          </>
        )}
      </div>
    </>
  );
}
