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
} from "@heroicons/react/24/solid";
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

  return (
    <div className="">
      <div className="h-8 w-8 fixed">
        <button
          onClick={() => setHidden(!hidden)}
          className={`lg:hidden px-2 py-1 h-10 w-10 m-3 rounded-full bg-blue-2 ${
            hidden ? "ml-72" : "ml-3"
          }`}
        >
          {hidden ? <ChevronDoubleLeftIcon /> : <ChevronDoubleRightIcon />}
        </button>
      </div>
      <div
        className={`${
          hidden ? "flex" : "hidden lg:flex"
        } flex-col h-full min-w-[278px] bg-gray-800 fixed z-40 transition-all duration-1000 delay-500`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 hover:overflow-y-scroll overflow-hidden">
          {/* <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" />
          </div> */}
          <nav
            className="mt-5 flex-1 px-2 bg-gray-800 space-y-1"
            aria-label="Sidebar"
          >
            <button
              onClick={handleNewChat}
              className="text-white bg-gray-700 hover:bg-gray-500 hover:text-gray-200
            group flex items-center px-2 py-2 text-md font-bold rounded-md cursor-pointer"
            >
              Start new chat
            </button>
            <p className="text-white text-md font-semibold px-1">Today</p>
            {chatsToday?.map((item: any) => (
              <p
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
            group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"
            }`}
              >
                {item.title}
              </p>
            ))}
            <p className="text-white text-md font-semibold px-1">Yesterday</p>
            {chatsYesterday?.map((item: any) => (
              <p
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
            group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"
            }`}
              >
                {item.title}
              </p>
            ))}
            <p className="text-white text-lg font-semibold px-1">
              Previous 7 Days
            </p>
            {chatsPreviousSevenDays?.map((item: any) => (
              <p
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
            group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"
            }`}
              >
                {item.title}
              </p>
            ))}
            <p className="text-white text-md font-semibold px-1">
              Rest of the chats
            </p>
            {olderChats?.map((item: any) => (
              <p
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className={`text-gray-300 hover:bg-gray-700 hover:text-white
            group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              slug == item.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"
            }`}
              >
                {item.title}
              </p>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex bg-gray-700 p-4">
          <a href="#" className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Tom Cook</p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  View profile
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChatNav;
