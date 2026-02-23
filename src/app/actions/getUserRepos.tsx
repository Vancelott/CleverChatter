export const fetchRepoList = async () => {
  const { data: repoGetRequest } = await octokit.rest.repos.listForUser({
    username,
  });

  const repoList = await repoGetRequest;

  setData(repoList);
};
