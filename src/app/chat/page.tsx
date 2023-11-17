"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "../actions/getCurrentUser";
import octokit from "../libs/octokit";
import getSession from "../actions/getSession";
import GetUsername from "../actions/getUsername";
import toast from "react-hot-toast";
import { HfInference } from "@huggingface/inference";
import { RepoList } from "./components/repoList";
import {
  RepoContent,
  ContentData,
  Repository,
  CurrentMessages,
} from "../types";
import createChat from "../actions/createChat";
import { send } from "process";
import UpdateChat from "../actions/updateChat";
import { useRouter } from "next/navigation";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export default function Chat() {
  const [data, setData] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  const [submit, setSubmit] = useState(false);
  const [repoData, setRepoData] = useState<string[]>([]);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [username, setUsername] = useState("Vancelott");

  const [mappedContent, setMappedContent] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastOutput, setLastOutput] = useState<string[]>([""]);
  const [messages, setMessages] = useState<CurrentMessages>({
    ai: [],
    user: [],
  });
  const [currentSortedMessages, setCurrentSortedMessages] = useState<any[]>();
  const [clickCount, setClickCount] = useState(0);

  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState("");

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // const getUserData = async () => {
    //   const currentUser = await getCurrentUser();
    //   console.log(currentUser);
    //   const username = currentUser?.username;
    //   setUsername(username!);
    // };
    // const getUserData = async () => {
    //   const usernameData = await GetUsername();
    //   console.log("test:", usernameData);
    //   setUsername(usernameData!);
    // };
    // console.log("username:", username);
  }, [username]);

  // const username = userData.user?.username

  const getUserData = async () => {
    const user = await getCurrentUser();
    console.log("test:", user?.name);
    setUsername(user?.username!);
  };

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

  const reposMap = data?.map((repo) => (
    <div key={repo.id} onClick={() => setSelectedRepo(repo.name)}>
      <p>{repo.name}</p>
    </div>
  ));

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
    // console.log("repoData in fetchContent:", repoData);
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
    } finally {
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
          // model: "google/flan-t5-xxl",
          model: "tiiuae/falcon-7b-instruct",
          // inputs: `Can you analyze some code for me? The code will be encoded, you just have to decode it and generate questions.`,
          // inputs: `Q: I will provide you with some code encoded in base64 at the end of this paragraph. Your task is to decode the code to basic text (I suggest utf-8), analyze the code itself and then generate 10 interview questions based on it. Code: ${mappedContent}`,
          // inputs: `Q: Decode the code, generate 10 interview questions based on it and provide them to me in plain text. Code: ${mappedContent}`,
          // inputs: `Imagine that you are an interviewer and you have to ask questions about this project. What would these questions be?: ${mappedContent}`,
          // best starter input so far inputs:
          //   "Hi, can you generate questions about a coding specific project, if I provide you with all the details? Disclaimer: there's no need to generate questions at the moment, please wait for me to send the code in the next message.",

          // this input generates questions too
          inputs: firstInput,
          // inputs: `At the end of this paragraph is a function from my project. Ask me a 1-2 questions about it - ${testFunction}`,
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
    // finally {
    //   for await (const output of hf.textGenerationStream(
    //     {
    //       // model: "google/flan-t5-xxl",
    //       model: "tiiuae/falcon-7b-instruct",
    //       // best input, generates actual questions
    //       // inputs: `Generate 10 technical interview questions, about the code, based on this project: ${contentData}`,
    //       // inputs: `Imagine that you are an interviewer and I'm the interviewee. Ask me questions about this code, as if you were interviewing me: ${contentData}`,
    //       // inputs: `Ask me questions about this code, as if you were interviewing me: ${contentData}`,
    //       // inputs: `Analyze the code at the end of this paragraph and ask me questions it, so you can better understand its functionality. For example, you can ask me what's the purpose of a specific function etc.: ${contentData}`,
    //       // inputs: `Analyze the code at the end of this paragraph and generate 10 questions which I might get asked about its functionality or the overall project: ${mappedContent}`,
    //       // inputs: `Analyze the code at the end of this paragraph and generate 10 questions which I might get asked about its functionality or the overall project. In addition to that, pick 2 functions and generate a question about them specifically: ${mappedContent}`,
    //       parameters: {
    //         max_new_tokens: 2500,
    //         return_full_text: false,
    //         truncate: 1000,
    //         top_k: 50,
    //         repetition_penalty: 1.2,
    //         top_p: 0.95,
    //         temperature: 0.9,
    //       },
    //     },
    //     {
    //       use_cache: false,
    //     }
    //   )) {
    //     const outputData = [output.token.text];
    //     setOutput((prevState) => [...prevState, ...outputData]);
    //     console.log(output);
    //   }
    // }

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
    // return selectedChildRepo;
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
        await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "src/app");
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
              <p className="font-bold text-5xl pb-4 whitespace-nowrap">
                Your repositories
              </p>
              <p className="font-extralight text-xl pb-4">
                Choose a repository to prepare on
              </p>
              <RepoList data={data} handleCallback={getSelectedRepo} />
              <button
                onClick={handleSubmit}
                className="mt-10 bg-blue-2 px-3 py-3 rounded-xl text-white-1 font-medium text-xl hover:bg-blue-1 transition-bg-color duration-300"
              >
                Submit
              </button>

              {/* <button
                onClick={handleSubmit}
                className="font-semibold text-md px-4 py-2 mt-6 bg-white-0 text-blue-0 rounded-md"
              >
                Submit
              </button> */}
            </div>
          </>
        )}
        {hideList && (
          <>
            <div className="px-4 mx-auto flex flex-col max-w-5xl">
              <div className="flex justify-start flex-col">
                {messages.user?.map((userMessage: string, index) => (
                  <div key={index}>
                    <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl">
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
              <div>
                <div className="static">
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
                      className="w-full p-2 shadow-sm focus:ring-blue-3 z-15 resize-none focus:border-blue-3 block text-black sm:text-sm border-gray-300 rounded-md mt-10 overflow-visible"
                      defaultValue={""}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
