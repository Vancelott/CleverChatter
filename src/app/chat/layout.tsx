import "../globals.css";
import type { Metadata } from "next";
import ChatNav from "./components/chatNav";
import getCurrentUser from "../actions/getCurrentUser";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex w-full min-h-screen bg-blue-00 relative">
      <div className="z-50">
        <ChatNav currentUser={currentUser!} />
      </div>
      <div className="h-full w-full px-4 md:px-24 bg-blue-00 overflow-auto">
        {children}
      </div>
    </div>
  );
}
