"use server";

import octokit from "../libs/octokit";
import { ContentData, RepoContent } from "../types";

const GetRepoContent = async (owner: string, repo: string, path: string) => {
  // gets all of the paths within a folder in the repo
  const fetchItemPaths = async (owner: string, repo: string, path: string) => {
    throw new Error();

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    let pathData: string[] = [];

    for await (const item of data) {
      if (item.type === "file") {
        pathData.push(item.path);
      } else if (item.type === "dir") {
        const newData = await fetchItemPaths(owner, repo, (path = `/${item.path}`));
        const filteredNewData = newData.filter((item) => item != null);
        pathData.push(...filteredNewData);
      }
    }
    return pathData;
  };

  // gets each file's content from the repoData, from the `fetchItemPaths` call
  const fetchContent = async (owner: string, repo: string, pathData: string[]) => {
    let contentDataArray: Array<{ name: string; content: string }> = [];
    for (const item of pathData) {
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
      contentDataArray.push(contentObject);
    }
    return contentDataArray;
  };

  // decodes the file's content from the `fetchContent` call
  const decodeContent = async (contentData: Array<{ name: string; content: string }>) => {
    const contentMap = await contentData.map((item) => item.content);
    const decodedContent = contentMap.map((encodedString) => atob(encodedString));

    return decodedContent;
  };

  const pathData = await fetchItemPaths(`${owner}`, `${repo}`, "");
  const contentData = await fetchContent(`${owner}`, `${repo}`, pathData);
  const decodedRepoContent: string[] = await decodeContent(contentData);

  return decodedRepoContent;
};

export default GetRepoContent;
