"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RepoList } from "../components/repoList";
import { Repository, CurrentMessages, IChatComp } from "../../types";
import createChat from "../../actions/createChat";
import UpdateMessages from "../../actions/updateMessages";
import { useRouter } from "next/navigation";
import GetRepoContent from "../../actions/getRepoContent";
import Loading from "../loading";
import toast, { Toaster } from "react-hot-toast";
import GetRepo from "../../actions/getRepo";
import CreateRepo from "../../actions/createRepo";
import { JSONParser } from "@streamparser/json";
import UpdateChat from "../../actions/updateChat";
import { createPrompt } from "../../libs/helpers";
import GetMessages from "@/app/actions/getMessages";
import SuspenseMessage from "./suspenseMessage";

const firstUserPrompt = `Generate 3-5 one line questions in bullet points that I might get asked in a coding related job interview. Respond in JSON, and create a "cache" to store 2 to 3 additional short questions about the provided repo, and a short summary of the repo's contents, as well as 1 or 2 code snippets that you find interesting, which you can use to generate more questions in case the initial ones are already exhausted. The response has to be in valid JSON format, with only a response and cache as parents.`;

const displayedFirstPrompt =
  "Hello! Please provide me with a few questions for my project that I've selected, in order to prepare for an upcoming job interview.";

export const ChatComp = (props: IChatComp) => {
  const { username, repos, initialMessages, pageData } = props;
  const { ref: myRef, inView: entryVisibility, entry } = useInView(); // used to fetch messages once the top message is visible

  const [submit, setSubmit] = useState(false);
  const [prompt, setPrompt] = useState({
    input: "",
    output: "",
    streamedOutput: "",
  });

  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [...(initialMessages?.ai ?? [])],
    user: [...(initialMessages?.user ?? [])],
  });

  const [isInitial, setIsInitial] = useState(props.cache == null || props.slug == null);
  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState(props.slug ?? "");
  const [selectedChildRepo, setSelectedChildRepo] = useState("");
  const [repoData, setRepoData] = useState<string[]>(props.repoData ?? []);
  const [cache, setCache] = useState(props.cache ?? "");

  const messagesRef = useRef(null);

  // page "1" is fetched initially in "[slug]/page.tsx" and the pageData is optional, as it is only used in `[slug]`
  const [pages, setPages] = useState({
    page: 2,
    pageSize: pageData?.pageSize,
    totalPages: pageData?.totalPages,
    totalMessages: pageData?.totalMessages,
  });

  const router = useRouter();

  // creates chat once the full output from the ai is available
  useEffect(() => {
    if (!chatSlug && prompt.output.length > 1 && selectedChildRepo.length > 1) {
      const create = async () => {
        let slug;
        const chat = await createChat(
          displayedFirstPrompt,
          prompt.output,
          selectedChildRepo,
        );
        slug = chat?.slug!;

        // TODO call updateRepo instead, to add the slug directly?
        const repo = await CreateRepo(selectedChildRepo, repoData, slug!);

        setChatSlug(chat?.slug!);

        await UpdateChat(slug, cache);
      };
      setPrompt((prev) => ({ ...prev, output: "" }));
      create();
    }
    return () => {};
  }, [cache, chatSlug, prompt.output, repoData, selectedChildRepo]);

  const fetchMessages = useCallback(async () => {
    if (!pages.pageSize || !pages.totalPages) {
      return;
    }

    if (pages.page + 1 > pages.totalPages) {
      return;
    }
    const fetchedMessages = await GetMessages(
      chatSlug,
      pages.page,
      pages.pageSize,
      pages.totalPages,
    );

    if (fetchedMessages == null || fetchedMessages.AiMessages.length <= 0) {
      return null;
    }

    const aiMsgs = fetchedMessages!.AiMessages.map((msg) => msg.messageContent);
    const userMsgs = fetchedMessages!.UserMessages.map((msg) => msg.messageContent);

    setMessages((prev) => ({
      ai: [...prev.ai, ...aiMsgs],
      user: [...prev.user, ...userMsgs],
    }));

    setPages((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [chatSlug, pages]);

  useEffect(() => {
    if (!isInitial) {
      const timeout = setTimeout(async () => {
        if (entryVisibility === true) {
          const fetchedMessages = await fetchMessages();
          if (fetchedMessages != null) {
            window.scrollTo({ left: 0, top: 500, behavior: "smooth" });
          }
        }
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [entryVisibility, fetchMessages, isInitial]);

  useEffect(() => {
    if (chatSlug.length > 1) {
      // window.history.pushState(null, "", `/chat/${chatSlug}`);
      router.replace(`/chat/${chatSlug}`, { scroll: false });
    }
  }, [chatSlug, router]);

  useEffect(() => {
    if (chatSlug && prompt.output.length > 0) {
      UpdateMessages(prompt.input, prompt.output, chatSlug);
      setPrompt((prev) => ({ ...prev, input: "", output: "" }));
    }
  }, [chatSlug, prompt.input, prompt.output]);

  const createFirstInput = (decodedContent: string[]) => {
    return `Answer the following in 200 words or less: ${firstUserPrompt}. The questions have to be specific for the code attached after this sentence: """${decodedContent}""" `;
  };

  const handleInputSubmit = async (input: string) => {
    let currentReply = "";
    let currentCache = "";
    let err = false;

    setPrompt((prev) => ({ ...prev, streamedOutput: "" }));

    const prompt = await createPrompt(messages, input, cache, isInitial);

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
          setPrompt((prev) => ({
            ...prev,
            streamedOutput: prev.streamedOutput + parsedData.error.message,
          }));
          setPrompt((prev) => ({ ...prev, streamedOutput: parsedData.error.message }));
          currentReply += parsedData.error.message;
          toast.error(currentReply);
          break;
        } else {
          let text = parsedData.candidates?.[0]?.content?.parts?.[0]?.text!;
          // TODO maybe use jsonParser.write(JSON.stringify(text)) instead? This might not be necessary if the schema is improved.
          text = text.replace("```json", "").replace("```", "").replace("`", "");

          if (isInitial) {
            jsonParser.onValue = ({ value, key, parent, stack }) => {
              if (Array.isArray(value)) {
                const objects = value.map((obj) => JSON.stringify(obj));
                currentReply += objects;
                return;
              }
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
          } else {
            // no special parsing is needed
            currentReply += text;
          }

          setPrompt((prev) => ({
            ...prev,
            streamedOutput: currentReply,
          }));
          if (!done) continue;
        }
      }
    }

    if (isInitial && cache.length <= 0) {
      setCache(JSON.stringify(currentCache));
    }

    if (!err) {
      setPrompt((prev) => ({ ...prev, output: currentReply }));
      setMessages((prev) => ({
        ...prev,
        ai: [...prev.ai, currentReply],
      }));
    }

    return currentReply;
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

  const handleSubmit = async () => {
    if (prompt.input.length <= 0 && !isInitial) {
      toast.error("Please type in a message.");
    }
    setSubmit(true);

    try {
      if (isInitial) {
        setHideList(true);
        setMessages((prev) => ({
          ...prev,
          user: [...prev.user, displayedFirstPrompt],
        }));

        const repoContent = repoData.length > 0 ? repoData : await handleRepoFetch();

        // TODO use createPrompt here?
        const initialInput = await createFirstInput(repoContent);
        repoData.length <= 0 ? setRepoData(() => repoContent) : null;
        await handleInputSubmit(initialInput);

        setIsInitial(false);
      } else {
        setMessages((prev) => ({
          ...prev,
          user: [...prev.user, prompt.input],
        }));
        await handleInputSubmit(prompt.input);
      }
    } catch (error) {
      setSubmit(false);
      setHideList(false);
      setPrompt((prev) => ({ ...prev, input: "" }));

      setMessages((prev) => ({
        ...prev,
        user: prev.user.filter((msg) => msg !== prompt.input),
      }));

      console.error(error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setSubmit(false);
    }
  };

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-5xl">
        {/* Repository List */}
        {isInitial && !hideList && (
          <>
            <Suspense fallback={<Loading />}>
              <div className="flex flex-col justify-center items-center bg-blue-00 h-screen mx-auto relative z-10">
                <p className="font-extrabold text-5xl pb-4 whitespace-nowrap">
                  Your repositories
                </p>
                <p className="font-semibold text-xl pb-4">
                  Choose a repository to prepare on
                </p>
                <RepoList data={repos} handleCallback={setSelectedChildRepo} />
                <button
                  onClick={() => (selectedChildRepo ? handleSubmit() : undefined)}
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
        {/* Messages and chat input*/}
        {(!isInitial || messages.user.length > 0) && (
          <>
            <Suspense fallback={<Loading />}>
              <div className="w-full min-h-screen mx-auto flex flex-col justify-between max-w-5xl px-8 md:px-24 mb-6 mt-10">
                <div className="flex justify-start flex-col-reverse">
                  {messages.user.length === 0 && <Loading />}
                  {messages.user?.map((userMessage: string, index) => (
                    <div key={index} ref={index == 0 ? myRef : null}>
                      <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-6">
                        {userMessage}
                      </p>
                      <div className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
                        {messages.ai[index] ? (
                          messages.ai[index]
                        ) : prompt.streamedOutput.length > 0 ? (
                          prompt.streamedOutput
                        ) : (
                          <SuspenseMessage />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {(selectedChildRepo || messages.ai.length > 0) && (
                  <div className="static mb-16 flex-shrink-0">
                    <div className="relative flex flex-col">
                      <button
                        onClick={() => {
                          submit ? null : handleSubmit();
                        }}
                        disabled={submit}
                        className={`absolute right-0 top-[3.9rem] bg-blue-1 hover:bg-blue-2 text-white py-2 px-4 rounded-full mr-4 mt-2 z-10 ${
                          submit ? "opacity-90 bg-blue-4 cursor-not-allowed" : ""
                        }`}
                      >
                        Submit
                      </button>
                      <textarea
                        rows={4}
                        name="comment"
                        id="comment"
                        value={prompt.input}
                        disabled={submit}
                        placeholder="Send a message"
                        className="w-full p-2 shadow-sm focus:ring-blue-3 pr-24 z-5 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible disabled:bg-slate-200 disabled:opacity-80 disabled:hover:cursor-not-allowed"
                        onChange={(e) =>
                          setPrompt((prev) => ({ ...prev, input: e.target.value }))
                        }
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
};

export default ChatComp;
