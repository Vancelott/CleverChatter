"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import octokit from "./libs/octokit";
import getSession from "./actions/getSession";
import GetUsername from "./actions/getUsername";
import axios from "axios";
import toast from "react-hot-toast";
import { HfInference } from "@huggingface/inference";

const hfToken = process.env.HF_ACCESS_TOKEN;

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

interface Repo {
  download_url: string;
  git_url: string;
  html_url: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  url: string;
  _links: {
    git: string;
    html: string;
    self: string;
  };
}

interface RepoContent {
  data: {
    type: string;
    size: number;
    name: string;
    path: string;
    content: string;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
    _links: {
      git: string | null;
      html: string | null;
      self: string;
    };
  };
}

interface ContentDataItem {
  name: string;
  content: string;
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  const [submit, setSubmit] = useState(false);
  const [repoData, setRepoData] = useState<string[]>([""]);
  const [contentData, setContentData] = useState<ContentDataItem[]>([]);
  const [username, setUsername] = useState("Vancelott");

  const [mappedContent, setMappedContent] = useState<string[]>([""]);
  const [output, setOutput] = useState<string[]>([""]);

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

  const handleSubmit = async (owner: string, repo: string, path: string) => {
    setSubmit(true);
    const { data: pullRequest } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const pathData: string[] = [];

    for (const item of pullRequest) {
      if (item.type === "dir") {
        const newData = await handleSubmit(
          owner,
          repo,
          (path = `/${item.path}`)
        );
        const allPromises = await Promise.all(newData);

        const filesFilter = allPromises.filter((item) => item.type === "file");
        const promisesMap = filesFilter.map((item) => item.path);

        pathData.push(...promisesMap);
      }
    }

    // setRepoData((prevRepoData) => [...prevRepoData, ...pathData]);
    setRepoData([...pathData]);

    return pullRequest;
  };

  const fetchContent = async (owner: string, repo: string) => {
    const contentDataArray: Array<{ name: string; content: string }> = [];
    try {
      for (const item of repoData) {
        const getContent = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item,
        });

        const responseData: RepoContent = await getContent;
        console.log(responseData);
        // const contentMap = responseData.map((item: any) => item.content);
        const contentObject = {
          name: responseData.data.name,
          content: responseData.data.content,
        };
        contentDataArray.push(contentObject);
      }

      setContentData([...contentDataArray]);
    } catch (error) {
      console.error("Error fetching content:", error);
    }

    return contentData;
  };

  useEffect(() => {
    const contentMap = contentData.map((item) => item.content);

    // const decodedContent = atob(contentMap);

    const decodedContent = contentMap.map((encodedString) =>
      atob(encodedString)
    );

    setMappedContent((prevState) => [...prevState, ...decodedContent]);
  }, [contentData]);

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

  const sendData = async () => {
    try {
      setOutput([]);
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
          inputs: `At the end of this paragraph is my project. Help me prepare for an interview by providing me with example questions which I might get asked about this code specifically. ${contentData}`,
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
          },
        },
        {
          use_cache: false,
        }
      )) {
        if (output.token.text !== "<|endoftext|>") {
          const outputData = [output.token.text];

          setOutput((prevState) => [...prevState, ...outputData]);
          // setOutput(output.token.text);
          console.log(output);
        }
      }

      console.log(output);
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
  };

  // const sendData = async () => {
  //   const code = await agent.generateCode(
  //     "Draw a picture of a cat wearing a top hat. Then caption the picture and read it out loud."
  //   );
  //   console.log(code);
  //   const messages = await agent.evaluateCode(code);
  //   console.log(messages); // contains the data
  // };

  // const sendData = async () => {
  //   // let classifier = await pipeline("text2text-generation", "Xenova/llama-68m");

  //   // e twa she polzwam, stiga da zaraboti ili Xenova/llama-68m
  //   // const pipe = await pipeline("text2text-generation", "Xenova/t5-base");

  //   const pipe = await pipeline(
  //     "text2text-generation",
  //     "Xenova/LaMini-Flan-T5-783M"
  //   );

  //   // const request = await pipe({
  //   //   inputs:
  //   //     "If I provide you with some code, would you be able to analyze it?",
  //   // });
  //   const request = await pipe(
  //     "If I provide you with some code, would you be able to analyze it?",
  //     { max_new_tokens: 100 }
  //   );

  //   let result = await request;

  //   console.log(result); // contains the data
  // };

  // const sendData = async () => {
  //   try {
  //     const data = await axios
  //       .post("/classify/", { text: "Hi, can you analyze some code?" })
  //       .then((response) => {
  //         console.log(response);
  //         return response;
  //       })
  //       .catch((error) => {
  //         console.log(error.response);
  //       });

  //     const result = await data;

  //     console.log("Axios Result:", result);

  //     return data;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <main className="">
      <div className="grid grid-cols-2 min-h-screen items-center justify-center p-24">
        <div className="flex flex-col items-center justify-between">
          <p>Home page</p>
          <p>User: {username}</p>
          <button onClick={getUserData}>Test list</button>
          <div onClick={(event) => event.target}>Your repos: {reposMap}</div>
          <p>Currently selected: {selectedRepo}</p>
          <button
            onClick={() =>
              handleSubmit(`${username}`, `${selectedRepo}`, "src/app")
            }
          >
            Submit selected repo
          </button>
          <button onClick={() => console.log(repoData)}>Log RepoData</button>
          <button
            onClick={() => fetchContent(`${username}`, `${selectedRepo}`)}
          >
            Fetch ContentData
          </button>
          <button onClick={() => console.log(contentData)}>
            Log ContentData
          </button>
          <button onClick={() => toast("Hi!")}>Toast</button>
          <button onClick={sendData}>Send Data</button>
        </div>
        <p>Output: {output}</p>
      </div>
    </main>
  );
}
