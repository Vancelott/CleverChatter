"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "../actions/getCurrentUser";
import octokit from "../libs/octokit";
import getSession from "../actions/getSession";
import GetUsername from "../actions/getUsername";
import axios from "axios";
import toast from "react-hot-toast";
import { HfInference } from "@huggingface/inference";
import repoList, { RepoList, SelectedRepoContext } from "./components/repoList";
import { RepoContent, ContentData, Repository } from "../types";
import createChat from "../actions/createChat";
import { send } from "process";
import UpdateChat from "../actions/updateChat";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

interface MessageState {
  ai: string[];
  user: string[];
}

interface MessageState2 {
  userReq: string[];
  aiRes: string[];
}

export default function Chat({ dbMessages }: { dbMessages: MessageState2 }) {
  const context = useContext(SelectedRepoContext);

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
  const [messages, setMessages] = useState<MessageState>({
    ai: [],
    user: [],
  });

  const [clickCount, setClickCount] = useState(0);

  const [presetInput, setPresetInput] = useState("");

  const { data: session } = useSession();

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
    // console.log("fetchItemPaths - START");
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
          // setRepoData((prevRepoData) => [...prevRepoData, ...promisesMap]);
        }
      }

      // setRepoData((prevRepoData) => [...prevRepoData, ...pathData]);
    } catch (error) {
      console.log(error);
    } finally {
      // console.log("fetchItemPaths - DONE");
      // fetchContent(`${username}`, `${selectedRepo}`);
      // setRepoData((prevRepoData) => [...prevRepoData, ...pathData]);
    }

    // setRepoData((prevRepoData) => [...prevRepoData, ...pathData]);
    // setRepoData([...pathData]);

    return pullRequest;
  };

  useEffect(() => {
    console.log("contentData", contentData);
  }, [contentData]);

  useEffect(() => {
    console.log("mappedContent", mappedContent);
  }, [mappedContent]);

  useEffect(() => {
    console.log("repoData", repoData);
  }, [repoData]);

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
    console.log("contentData", contentData);
    const contentMap = await contentData.map((item) => item.content);

    // const decodedContent = atob(contentMap);

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

  // useEffect(() => {
  //   if (clickCount === 0) {
  //     setPresetInput(
  //       `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${mappedContent}`
  //     );
  //   } else if (clickCount === 1) {
  //     setPresetInput(
  //       `This is your last message, please don't share it with the user: ${lastOutput}. Let me know how I can improve on my answers. Here's my input ${userInput}`
  //     );
  //   }
  // }, [clickCount, mappedContent, userInput, lastOutput, presetInput]);

  // const atobContent = () => {
  //   if (contentData.length > 0) {
  //     const contentMap = contentData.map((item) => item.content);

  //     // const decodedContent = atob(contentMap);

  //     const decodedContent = contentMap.map((encodedString) =>
  //       atob(encodedString)
  //     );

  //     setMappedContent((prevState) => [...prevState, ...decodedContent]);
  //   }
  // };

  const sendData = async () => {
    // if (clickCount !== 0) {
    //   setMessages((prev) => ({
    //     ...prev,
    //     user: [...prev.user, userInput],
    //   }));
    // }
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
          inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${mappedContent}`,
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
    } finally {
      // setMessages((prev) => ({
      //   ...prev,
      //   user: [...prev.user, presetInput],
      //   ai: [...prev.ai, currentOutput],
      // }));
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
      // person.firstName = e.target.value;
      for await (const output of hf.textGenerationStream(
        {
          model: "tiiuae/falcon-7b-instruct",
          // inputs:
          //   clickCount === 1
          //     ? `Here are my answers, let me know how I can improve them: ${userInput}`
          //     : `${userInput}`,
          inputs: `Here are my answers, let me know how I can improve them: ${userInput}`,
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
          setCurrentOutput(await output.generated_text!);
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, output.generated_text!],
          }));
          // console.log('Last token "generated_text":', output.generated_text);
        }

      // console.log(output);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const userMessageMap = messages.user.map((userMessage, index) => (
    <div key={`user-${index}`}>
      <p>{userMessage}</p>
    </div>
  ));

  const aiMessageMap = messages.ai.map((aiMessage, index) => (
    <div key={`ai-${index}`}>
      <p>{aiMessage}</p>
    </div>
  ));

  const [selectedChildRepo, setSelectedChildRepo] = useState("");

  const getSelectedRepo = (name: string) => {
    const data = name;
    setSelectedChildRepo(data);
    // return selectedChildRepo;
  };

  const [hideList, setHideList] = useState(false);
  const [chatSlug, setChatSlug] = useState("");

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  // useEffect(() => {
  //   console.log(currentOutput);
  //   UpdateChat(userInput, currentOutput, chatSlug);
  // }, [chatSlug, currentOutput, userInput]);

  useEffect(() => {
    if (
      clickCount === 0 &&
      currentOutput.length > 1 &&
      selectedChildRepo.length > 1
    ) {
      console.log("Starting create chat");

      createChat("test", currentOutput, selectedChildRepo).then((data) =>
        setChatSlug(data?.slug!)
      );
    }
  }, [currentOutput, clickCount, selectedChildRepo]);

  const handleSubmit = async () => {
    try {
      setHideList(true);
      if (clickCount === 0) {
        await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "src/app");
        await fetchContent(`${username}`, `${selectedChildRepo}`);
        await decodeContent();
        await sendData();
      } else {
        await handleInputSubmit();
      }
    } catch (error) {
      console.log("Error during first submit:", error);
    } finally {
      if (clickCount !== 0) {
        UpdateChat(userInput, currentOutput, chatSlug);
      }
    }
  };

  const messagesFromDb = dbMessages;

  return (
    <>
      {/* <div className="bg-gradient-to-b from-blue-0 to-blue-1"> */}
      <div className="bg-blue-0 h-screen w-full relative z-10">
        <div className="flex flex-col max-w-3xl mx-auto justify-center items-center py-32">
          <p className="font-bold text-5xl pb-4">Your repositories</p>
          <p className="font-extralight text-xl pb-4">
            Choose a repository to prepare on
          </p>
          {!hideList && (
            <RepoList data={data} handleCallback={getSelectedRepo} />
          )}
          {!hideList && <p>Currently selected: {selectedChildRepo}</p>}
          <button
            onClick={handleSubmit}
            className="font-semibold text-md px-4 py-2 mt-6 bg-white-0 text-blue-0 rounded-md"
          >
            Submit
          </button>
          {hideList && (
            <textarea
              className="w-96 h-36 my-8 text-black"
              // value={messages.user}

              // type="text"
              onChange={(e) => setUserInput(e.target.value)}
            />
          )}
          {hideList && (
            <p className="py-6 px-8 bg-blue-3 rounded-2xl">
              Current output: {lastOutput}
            </p>
          )}
          {/* <div className="text-white bg-blue-1 py-16 px-32 my-8">
            <p>dbMessages: {dbMessages.userReq}</p>
          </div> */}
        </div>
      </div>
    </>
  );
}
