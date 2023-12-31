"use client";

import React, { useEffect, useState } from "react";
import octokit from "../libs/octokit";
import { HfInference } from "@huggingface/inference";
import { RepoList } from "./components/repoList";
import {
  RepoContent,
  ContentData,
  Repository,
  CurrentMessages,
} from "../types";
import createChat from "../actions/createChat";
import UpdateChat from "../actions/updateChat";
import { useRouter } from "next/navigation";
import getCurrentUser from "../actions/getCurrentUser";
import Loading from "./loading";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export default function Chat() {
  const [data, setData] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  const [submit, setSubmit] = useState<boolean>(false);
  const [repoData, setRepoData] = useState<string[]>([]);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [username, setUsername] = useState<string>("");

  const [mappedContent, setMappedContent] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [lastOutput, setLastOutput] = useState<string[]>([""]);
  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });
  const [clickCount, setClickCount] = useState(0);
  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState("");
  const router = useRouter();

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

  const fetchItemPaths = async (owner: string, repo: string, path: string) => {
    setSubmit(true);
    const { data: pullRequest } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const pathData: string[] = [];

    try {
      for await (const item of pullRequest) {
        if (item.type === "dir") {
          const newData = await fetchItemPaths(
            owner,
            repo,
            (path = `/${item.path}`)
          );
          const allPromises = await Promise.all(newData);

          const filesFilter = allPromises.filter(
            (item) => item.type === "file"
          );
          const promisesMap = filesFilter.map((item) => item.path);

          repoData.push(...promisesMap);
        }
      }
    } catch (error) {
      console.log(error);
    }

    return pullRequest;
  };

  const fetchContent = async (owner: string, repo: string) => {
    const contentDataArray: Array<{ name: string; content: string }> = [];
    try {
      console.log("repoData in fetchContent:", repoData);
      for await (const item of repoData) {
        console.log("item:", item);
        const getContent = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item,
        });

        const responseData: RepoContent = await getContent;
        const contentObject = {
          name: responseData.data.name,
          content: responseData.data.content,
        };
        contentData.push(contentObject);
      }

      // setContentData([...contentDataArray]);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
    return contentData;
  };

  const decodeContent = async () => {
    const contentMap = await contentData.map((item) => item.content);
    const decodedContent = contentMap.map((encodedString) =>
      atob(encodedString)
    );
    setMappedContent((prevState) => [...prevState, ...decodedContent]);
  };

  const testFunction = `const listingCount = await prisma?.listing.count({
    where: {
      ...(makeParam && { make: { equals: makeParam } }),
      ...(modelParam && { model: { equals: modelParam } }),
      ...(yearParam && { year: { gte: yearParam } }),
      ...(priceParam && { price: { lte: parseInt(priceParam) } }),
      ...(fuelParam && { fuel: { equals: fuelParam } }),
      ...(transParam && { transmission: { equals: transParam } }),
    },
  });`;

  const firstUserPrompt = `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically.`;

  const firstInput = `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${mappedContent}`;

  const sendData = async () => {
    if (clickCount === 0) {
      setMessages((prev) => ({
        ...prev,
        user: [...prev.user, firstUserPrompt],
      }));
    }
    try {
      // atobContent();
      setLastOutput([]);
      for await (const output of hf.textGenerationStream(
        {
          model: "tiiuae/falcon-7b-instruct",
          inputs: firstInput,
          parameters: {
            max_new_tokens: 1024,
            return_full_text: false,
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
          wait_for_model: true,
        }
      ))
        if (output.token.text !== "<|endoftext|>") {
          const outputData = [output.token.text];

          // setCurrentOutput(output.token.text);
          setLastOutput((prevState) => [...prevState, ...outputData]);

          // setOutput(output.token.text);
        } else {
          setCurrentOutput(output.generated_text!);
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, output.generated_text!],
          }));
        }

      // console.log(output);
    } catch (error) {
      console.log(error);
    }
    return currentOutput;
  };

  const handleInputSubmit = async () => {
    setMessages((prev) => ({
      ...prev,
      user: [...prev.user, userInput],
    }));

    try {
      setLastOutput([]);
      for await (const output of hf.textGenerationStream(
        {
          model: "tiiuae/falcon-7b-instruct",
          inputs:
            clickCount === 1
              ? `Here are my answers, let me know how I can improve them: ${userInput}`
              : `${userInput}`,
          parameters: {
            max_new_tokens: 1024,
            return_full_text: false,
            // num_return_sequences: 2,
            truncate: 1000,
            top_k: 50,
            repetition_penalty: 1.2,
            top_p: 0.95,
            temperature: 0.9,
            // do_sample: true,
          },
        },
        {
          use_cache: false,
        }
      ))
        if (output.token.text !== "<|endoftext|>") {
          const outputData = [output.token.text];

          // setCurrentOutput(output.token.text);
          setLastOutput((prevState) => [...prevState, ...outputData]);

          // setOutput(output.token.text);
        } else {
          setCurrentOutput(output.generated_text!);
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, output.generated_text!],
          }));
        }
    } catch (error) {
      console.log(error);
    }
  };

  const [selectedChildRepo, setSelectedChildRepo] = useState("");

  const getSelectedRepo = (name: string) => {
    const data = name;
    setSelectedChildRepo(data);
  };

  // creates chat once the full output from the ai is available
  useEffect(() => {
    if (
      clickCount === 0 &&
      currentOutput.length > 1 &&
      selectedChildRepo.length > 1
    ) {
      const firstUserPrompt = `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically.`;

      createChat(firstUserPrompt, currentOutput, selectedChildRepo).then(
        (data) => (
          setChatSlug(data?.slug!), setClickCount((prevCount) => prevCount + 1)
        )
      );
      setCurrentOutput("");
      setUserInput("");
    }
  }, [currentOutput, clickCount, selectedChildRepo]);

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

  const handleSubmit = async () => {
    try {
      setSubmit(true);
      setHideList(true);
      if (clickCount === 0) {
        await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "");
        await fetchContent(`${username}`, `${selectedChildRepo}`);
        await decodeContent();
        await sendData();
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
                onClick={() => (selectedChildRepo ? handleSubmit() : undefined)}
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
                        submit ? null : handleSubmit();
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
                        submit
                          ? "bg-slate-200 opacity-80 cursor-not-allowed"
                          : ""
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
