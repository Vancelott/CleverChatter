"use client";

import { fetchChatsAction } from "@/app/actions/actions";
import GetAllChats from "@/app/actions/getAllChats";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/solid";
// import { useRouter } from "next/navigation";

interface Chats {
  id: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  title: string;
  userId: string;
}

export const ChatNav = () => {
  // const chats = await GetAllChats();

  // const test = chats?.map((item) => item.title);

  const queryParams = new URLSearchParams("=");

  const router = useRouter();

  const handleClick = (selectedChatSlug: string) => {
    queryParams.append("slug", selectedChatSlug);
    router.push(`/chat/${selectedChatSlug}`, { scroll: false });
  };

  const [chats, setChats] = useState<any>();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const fetchChats = GetAllChats().then((data) => setChats(data));
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleNewChat = () => {
    router.push(`/chat`, { scroll: false });
  };

  // const chatMap =
  // (chats.length === 0) ? <p>No chats found</p> : (
  // chats?.map((item: any) => (
  //   <p
  //     key={item.id}
  //     onClick={() => handleClick(item.slug)}
  //     className="text-gray-300 hover:bg-gray-700 hover:text-white
  // group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer"
  //   >
  //     {item.title}
  //   </p>
  // )));

  return (
    <div className="">
      <div className="h-8 w-8 fixed">
        <button
          onClick={() => setHidden(!hidden)}
          className={`lg:hidden px-2 py-1 h-10 w-10 m-3 rounded-full bg-blue-2 ${
            hidden ? "ml-64" : "ml-3"
          }`}
        >
          {hidden ? <ChevronDoubleLeftIcon /> : <ChevronDoubleRightIcon />}
        </button>
      </div>
      <div
        className={`${
          hidden ? "flex" : "hidden lg:flex"
        } flex-col h-full bg-gray-800 fixed z-40 transition-all duration-1000 delay-500`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
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
            {chats?.map((item: any) => (
              <p
                key={item.id}
                onClick={() => handleClick(item.slug)}
                className="text-gray-300 hover:bg-gray-700 hover:text-white
            group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer"
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
