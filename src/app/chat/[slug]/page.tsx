import { redirect } from "next/navigation";

import GetRepo from "@/app/actions/getRepo";
import GetCurrentChat from "@/app/actions/getCurrentChat";
import getCurrentUser from "@/app/actions/getCurrentUser";
import octokit from "@/app/libs/octokit";
import ChatComp from "../components/chatComp";
import GetMessages from "@/app/actions/getMessages";
import GetTotalMessages from "@/app/actions/getTotalMessages";

export default async function Slug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await getCurrentUser();
  const chat = await GetCurrentChat(slug);
  if (user == null) {
    redirect("/");
  }

  if (chat == null) {
    // TODO redirect to error.ts
    redirect("/");
  }

  const username = user.username!;
  const totalMessages = await GetTotalMessages(slug);

  const pageSize = totalMessages > 0 ? (totalMessages % 2 === 0 ? 4 : 3) : 0;
  const totalPages = totalMessages > 0 ? Math.ceil(totalMessages / pageSize) : 0;
  const page = 1;

  const { data } = await octokit.rest.repos.listForUser({
    username,
  });

  const repo = await GetRepo("", slug);
  const cache = chat && chat.cache ? chat.cache : "";
  const repoData = repo?.repoData ? repo.repoData : [];

  const initialMessages = await GetMessages(slug, page, pageSize, totalPages);

  let msgs;

  let aiMessages = initialMessages?.AiMessages?.map((msg) => msg.messageContent) ?? [];
  let userMessages =
    initialMessages?.UserMessages?.map((msg) => msg.messageContent) ?? [];

  msgs = { ai: aiMessages, user: userMessages };

  return (
    <ChatComp
      username={username}
      repos={data}
      slug={slug}
      cache={cache}
      repoData={repoData}
      initialMessages={msgs}
      pageData={{
        totalMessages: totalMessages,
        pageSize: pageSize,
        totalPages: totalPages,
      }}
    />
  );
}
