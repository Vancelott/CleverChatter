import "../globals.css";
import type { Metadata } from "next";
import ChatNav from "./components/chatNav";
import getCurrentUser from "../actions/getCurrentUser";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex w-full h-screen bg-blue-00 relative overflow-hidden">
      <div className="z-50">
        <ChatNav currentUser={currentUser!} />
      </div>
      <div className="flex w-full h-screen bg-blue-00 mx-auto items-center justify-center content-center">
        <div className="h-max w-full lg:py-4 bg-blue-00 z-1">{children}</div>
      </div>
    </div>
  );
}
