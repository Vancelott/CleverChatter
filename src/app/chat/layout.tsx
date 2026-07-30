import "../globals.css";
import ChatNav from "./components/chatNav";
import getCurrentUser from "../actions/getCurrentUser";
import GetAllChats from "../actions/getAllChats";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  let allChats;

  try {
    allChats = await GetAllChats();
  } catch (error) {
    console.log("ChatLayout - GetAllChats error", error);
    allChats = null;
  }

  return (
    <div className="flex w-full min-h-screen bg-blue-00 relative">
      <div className="z-50">
        <ChatNav currentUser={currentUser!} allChats={allChats} />
      </div>
      <div className="h-full w-full px-4 md:px-24 bg-blue-00 overflow-auto">
        {children}
      </div>
    </div>
  );
}
