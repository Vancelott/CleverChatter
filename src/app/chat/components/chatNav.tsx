import GetAllChats from "@/app/actions/getAllChats";

export const ChatNav = async () => {
  const chats = await GetAllChats();

  const test = chats?.map((item) => item.title);

  return (
    <nav className="max-h-7xl my-auto">
      <div className=" px-4 sm:px-6 flex justify-start items-start">
        <div className="flex flex-col">
          <div>{test}</div>
          <div>{test}</div>
        </div>
      </div>
    </nav>
  );
};

export default ChatNav;
