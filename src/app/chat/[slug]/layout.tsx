import GetChatCreator from "@/app/actions/getChatCreator";
import Slug from "./page";

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const slug = params?.slug;

  const isCreator = await GetChatCreator(slug);

  return (
    <div className="h-screen w-full px-4 md:px-24 py-12 bg-blue-00 overflow-auto">
      <Slug isCreator={isCreator!} params={{ slug }} />
    </div>
  );
}
