import octokit from "../libs/octokit";
import { ContentData, RepoContent } from "../types";

export const GetRepoContent = async (owner: string, repo: string, path: string) => {
  // gets all of the paths within a folder in the repo
  const fetchItemPaths = async (owner: string, repo: string, path: string) => {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    let pathData: string[] = [];

    try {
      for await (const item of data) {
        if (item.type === "file") {
          pathData.push(item.path);
        } else if (item.type === "dir") {
          const newData = await fetchItemPaths(owner, repo, (path = `/${item.path}`));
          const filteredNewData = newData.filter((item) => item != null);
          pathData.push(...filteredNewData);
        }
      }
    } catch (error) {
      console.log(error);
    }
    return pathData;
  };

  // gets each file's content from the repoData, from the `fetchItemPaths` call
  const fetchContent = async (owner: string, repo: string, pathData: string[]) => {
    let contentDataArray: Array<{ name: string; content: string }> = [];
    try {
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
    } catch (error) {
      console.error("Error fetching content:", error);
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
