"use client";

import { fetchChatsAction } from "@/app/actions/actions";
import GetAllChats from "@/app/actions/getAllChats";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  HomeIcon,
  PlusIcon,
  // ChatBubbleLeftIcon,
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { ChatData } from "@/app/types";
import {
  eachDayOfInterval,
  isAfter,
  isBefore,
  isToday,
  subDays,
} from "date-fns";

// import { useRouter } from "next/navigation";

export const ChatNav = () => {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [hidden, setHidden] = useState(false);
  const [slug, setSlug] = useState("");

  const [chatsToday, setChatsToday] = useState<ChatData[]>([]);
  const [chatsYesterday, setChatsYesterday] = useState<ChatData[]>([]);
  const [chatsPreviousSevenDays, setChatsPreviousSevenDays] = useState<
    ChatData[]
  >([]);
  const [olderChats, setOlderChats] = useState<ChatData[]>([]);

  const queryParams = new URLSearchParams("=");
  const router = useRouter();

  const handleClick = (selectedChatSlug: string) => {
    setSlug(selectedChatSlug);
    queryParams.append("slug", selectedChatSlug);
    router.push(`/chat/${selectedChatSlug}`, { scroll: false });
  };

  useEffect(() => {
    try {
      const fetchChats = async () => {
        const fetch = await GetAllChats();
        const result = await fetch;
        setChats(result!);
      };
      fetchChats();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const dateToday = new Date();
    const dateYesterday = subDays(dateToday, 1);
    const datePreviousSevenDays = subDays(dateToday, 8);

    setChatsToday([]);
    setChatsYesterday([]);
    setChatsPreviousSevenDays([]);
    setOlderChats([]);

    chats?.forEach((chat) => {
      if (isToday(chat.createdAt)) {
        setChatsToday((prev) => [...prev, chat]);
      } else if (isBefore(dateYesterday, chat.createdAt)) {
        setChatsYesterday((prev) => [...prev, chat]);
      } else if (isBefore(datePreviousSevenDays, chat.createdAt)) {
        setChatsPreviousSevenDays((prev) => [...prev, chat]);
      } else {
        setOlderChats((prev) => [...prev, chat]);
      }
    });
  }, [chats]);

  const handleNewChat = () => {
    router.push(`/chat`, { scroll: false });
  };

  const handleHome = () => {
    router.push(`/`, { scroll: false });
  };

  return (
    <div className={`${hidden ? "pr-0" : "lg:pr-[288px]"}`}>
      <div className="h-8 w-8 fixed ">
        <button
          onClick={() => setHidden(!hidden)}
          className={`px-2 py-1 h-10 w-10 m-3 shadow-md shadow-gray-800 fixed rounded-full bg-blue-2 ${
            hidden ? "ml-3" : "ml-[18.5rem]"
          }`}
        >
          {hidden ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
        </button>
      </div>
      <div
        className={`${
          hidden ? "hidden" : "flex"
        } flex-col h-full min-w-[288px] bg-gray-800 fixed z-40 transition-all duration-1000 delay-500`}
      >
        <div className="flex flex-col pt-2 pb-4 hover:overflow-y-scroll overflow-hidden w-72">
          {/* <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" />
          </div> */}
          <nav
            className="mt-5 flex-1 px-2 bg-gray-800 space-y-1"
            aria-label="Sidebar"
          >
            <p className="text-white text-sm font-semibold px-1">Today</p>
            {chatsToday?.map((item: ChatData) => (
              <div
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
      group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer space-x-2 w-[268px]
      ${slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <p className="truncate text-ellipsis">{item.title}</p>
              </div>
            ))}
            <p className="text-white text-sm font-semibold px-1">Yesterday</p>
            {chatsYesterday?.map((item: ChatData) => (
              <div
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
    group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer space-x-2 w-[268px]
    ${slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <p className="truncate text-ellipsis">{item.title}</p>
              </div>
            ))}
            <p className="text-white text-sm font-semibold px-1">
              Previous 7 Days
            </p>
            {chatsPreviousSevenDays?.map((item: ChatData) => (
              <div
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
    group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer space-x-2 w-[268px]
    ${slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <p className="truncate text-ellipsis">{item.title}</p>
              </div>
            ))}
            <p className="text-white text-sm font-semibold px-1">
              Rest of the chats
            </p>
            {olderChats?.map((item: ChatData) => (
              <div
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
    group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer space-x-2 w-[268px]
    ${slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <p className="truncate text-ellipsis">{item.title}</p>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 bg-gray-700 p-4 justify-between border-t-2 border-gray-500">
          <div className="flex justify-start flex-row gap-4">
            {/* <div className="flex-none border py-2 px-2 rounded-md"> */}
            <button onClick={handleHome}>
              <div className="flex-none bg-gray-500 py-2 px-2 rounded-md cursor-pointer">
                <HomeIcon className="h-7 w-7 text-white" />
              </div>
            </button>
            <button className="flex-grow" onClick={handleNewChat}>
              <div className="flex flex-row items-center justify-center border py-2 pr-2 px-1 rounded-md font-semibold text-md cursor-pointer">
                <PlusIcon className="h-7 w-7 text-white" />
                New Chat
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatNav;
