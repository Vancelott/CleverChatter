import { redirect } from "next/navigation";
import getCurrentUser from "../actions/getCurrentUser";
import { ChatComp } from "../chat/components/chatComp";
import octokit from "../libs/octokit";

export default async function Chat() {
  const user = await getCurrentUser();

  if (user == null) {
    redirect("/");
  }

  const username = user.username!;

  const { data } = await octokit.rest.repos.listForUser({
    username,
  });

  return <ChatComp username={username} repos={data} />;
}
