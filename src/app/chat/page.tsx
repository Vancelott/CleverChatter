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
import SendCodeData from "../actions/sendCodeData";
import repoList, {
  RepoList,
  SelectedRepoContext,
} from "../../../components/repoList";
import { RepoContent, ContentData, Repository } from "../types";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

interface MessageState {
  ai: string[];
  user: string[];
}

export default function Chat() {
  const context = useContext(SelectedRepoContext);

  const [data, setData] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  const [submit, setSubmit] = useState(false);
  const [repoData, setRepoData] = useState<string[]>([]);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [username, setUsername] = useState("Vancelott");

  const [mappedContent, setMappedContent] = useState<string[]>([]);
  const [input, setInput] = useState("");
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

  // useEffect(() => {
  //   if (contentData.length > 0) {
  //     const contentMap = contentData.map((item) => item.content);

  //     // const decodedContent = atob(contentMap);

  //     const decodedContent = contentMap.map((encodedString) =>
  //       atob(encodedString)
  //     );

  //     setMappedContent((prevState) => [...prevState, ...decodedContent]);
  //   }
  // }, [contentData]);

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
  //   }
  //   // else if (clickCount === 1) {
  //   //   setPresetInput(
  //   //     `This is your last message, please don't share it with the user: ${lastOutput}. Let me know how I can improve on my answers. Here's my input ${input}`
  //   //   );
  //   // }
  // }, [clickCount, mappedContent, input, lastOutput, presetInput]);

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
    setMessages((prev) => ({
      ...prev,
      user: [...prev.user, input],
    }));
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
          setCurrentOutput(await output.generated_text!);
          // console.log('Last token "generated_text":', output.generated_text);
        }

      // console.log(output);
    } catch (error) {
      console.log(error);
    } finally {
      setMessages((prev) => ({
        ...prev,
        ai: [...prev.ai, currentOutput],
      }));
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
  };

  const handleInputSubmit = async () => {
    setMessages((prev) => ({
      ...prev,
      user: [...prev.user, input],
    }));
    try {
      setLastOutput([]);
      // person.firstName = e.target.value;
      for await (const output of hf.textGenerationStream(
        {
          model: "tiiuae/falcon-7b-instruct",
          // this input generates questions too
          inputs: `This is your last message, please don't share it with the user: ${lastOutput}. Here's my input ${input}`,
          parameters: {
            max_new_tokens: 250,
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

          setLastOutput((prevState) => [...prevState, ...outputData]);
          // console.log("generated_text: ", output.generated_text);
          // console.log(output);
        } else {
          const outputData = output.generated_text!;
          setMessages((prev) => ({
            ...prev,
            ai: [...prev.ai, outputData],
          }));
          setCurrentOutput(outputData);
          // console.log("currentOutput", currentOutput);
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

  const sendCode = async () => {
    const response = await axios.post("/api/prompt", {
      prompt: input,
    });
    const data = await response.data;
    console.log(data);

    const test = `${data}`;
    setLastOutput((prevState) => [...prevState, test]);
    // setMessages((prev) => ({
    //   ...prev,
    //   ai: [...prev.ai, data],
    // }));
    return data;
  };

  // return (
  //   <main className="">
  //     <div className="grid grid-cols-2 min-h-screen items-center justify-center p-24">
  //       <div className="flex flex-col items-center justify-between">
  //         <p>Home page</p>
  //         <p>User: {username}</p>
  //         <button onClick={getUserData}>Test list</button>
  //         <div onClick={(event) => event.target}>Your repos: {reposMap}</div>
  //         <p>Currently selected: {selectedRepo}</p>
  //         <button
  // onClick={() =>
  //   handleSubmit(`${username}`, `${selectedRepo}`, "src/app")
  // }
  //         >
  //           Submit selected repo
  //         </button>
  //         <button onClick={() => console.log(repoData)}>Log RepoData</button>
  // <button
  //   onClick={() => fetchContent(`${username}`, `${selectedRepo}`)}
  // >
  //   Fetch ContentData
  // </button>
  //         <button onClick={() => console.log(contentData)}>
  //           Log ContentData
  //         </button>
  //         <button
  //           onClick={() => {
  //             toast("Hi!"), console.log(messages);
  //           }}
  //         >
  //           Toast
  //         </button>
  // <button onClick={sendData}>Send Data</button>
  //         <p className="font-extralight text-4xl pb-4">Your repositories:</p>
  //         <RepoList data={data} />
  //       </div>
  //       <div className="flex flex-col items-center justify-between">
  //         {/* <p>Current: {currentOutput}</p> */}
  //         {/* <p>Current: {userMessageMap}</p> */}
  //         <p>Cuurent output: {currentOutput}</p>
  // <input
  //   className="w-80 text-black"
  //   // value={messages.user}
  //   type="text"
  //   onChange={(e) => setInput(e.target.value)}
  // />
  //         <button
  //           className="px-2 py-2 m-2 bg-slate-400"
  //           onClick={handleInputSubmit}
  //         >
  //           Submit input
  //         </button>
  //         {Object.entries(messages).map(([key, value]) => (
  //           // {Object.keys(messages).map((message) => (
  //           <div key={key} className="px-5 py-2">
  //             <a className="text-base font-medium font-rubik text-gray-100 hover:text-gray-400">
  //               {value}
  //             </a>
  //           </div>
  //         ))}
  //         <div>
  //           User:{userMessageMap}
  //           Ai:{aiMessageMap}
  //         </div>
  //         <p>Output: {lastOutput}</p>
  //       </div>
  //     </div>
  //   </main>
  // );

  const [selectedChildRepo, setSelectedChildRepo] = useState("");

  const getSelectedRepo = (name: string) => {
    const data = name;
    setSelectedChildRepo(data);
    // return selectedChildRepo;
  };

  // const [selectedRepoFromContext, setSelectedRepoFromContext] = useContext(SelectedRepoContext)

  const [hideList, setHideList] = useState(false);

  // const finalSubmit = async () => {
  //   new Promise<void>(async (resolve, reject) => {
  //     try {
  //       await handleSubmit(`${username}`, `${selectedChildRepo}`, "src/app");
  //       resolve();
  //     } catch (error) {
  //       reject(error);
  //       console.log(error);
  //     } finally {
  //       new Promise<void>(async (resolve, reject) => {
  //         await fetchContent(`${username}`, `${selectedRepo}`);
  //       });
  //       resolve();
  //       await sendData;
  //     }
  //   });
  // };

  const handleSubmit = async () => {
    try {
      setHideList(true);
      await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "src/app");
      await fetchContent(`${username}`, `${selectedChildRepo}`);
      await decodeContent();
      await sendData();
    } catch (error) {
      console.error("Error during first submit:", error);
    }
  };

  // const handleSubmit = async () => {
  //   // setClickCount((prevCount) => prevCount + 1);
  //   // if (clickCount === 0) {
  //   try {
  //     setHideList(true);
  //     await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "src/app");
  //     await fetchContent(`${username}`, `${selectedChildRepo}`);
  //     await sendData();
  //     // setHideList(true);
  //     // await fetchItemPaths(`${username}`, `${selectedChildRepo}`, "src/app")
  //     //   .then(async () => {
  //     //     await fetchContent(`${username}`, `${selectedChildRepo}`);
  //     //   })
  //     //   .then(async () => {
  //     //     await sendData();
  //     //   });
  //   } catch (error) {
  //     console.error("Error during first submit:", error);
  //   }

  //   // if (clickCount === 1) {
  //   //   try {
  //   //     await sendData();
  //   //   } catch (error) {
  //   //     console.error("Error during second submit:", error);
  //   //   }
  //   // } else {
  //   //   await handleInputSubmit();
  //   // }
  // };

  return (
    <>
      {/* <div className="bg-gradient-to-b from-blue-0 to-blue-1"> */}
      <div className="bg-blue-0 h-full">
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
          <input
            className="w-80 my-8 text-black"
            // value={messages.user}
            type="text"
            onChange={(e) => setInput(e.target.value)}
          />
          <p>Current output: {lastOutput}</p>
        </div>
      </div>
    </>
  );
}
