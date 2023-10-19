// import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Chat from "./page";
import Slug from "./page";
import GetMessages from "@/app/actions/getMessages";

// const inter = Inter({ subsets: ["latin"] });

export default async function SlugLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: {
    slug: string;
  };
}) {
  const slug = searchParams?.slug;

  // const fetchMessages = await GetMessages(slug);

  return (
    <div className="h-full w-full px-52">
      {children}
      {/* <Slug messages={fetchMessages} /> */}
    </div>
  );
}
