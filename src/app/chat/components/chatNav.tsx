"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  HomeIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ChatData, User, ISortedChats } from "@/app/types";
import { isBefore, isToday, subDays } from "date-fns";
import toast from "react-hot-toast";
import { redirect, RedirectType } from "next/navigation";

export const ChatNav = ({
  currentUser,
  allChats,
}: {
  currentUser: User;
  allChats: ChatData[] | null;
}) => {
  // TODO set to false if more than 1 chat in the list?
  const [hidden, setHidden] = useState(true);
  const [slug, setSlug] = useState("");

  const [sortedChats, setSortedChats] = useState<ISortedChats[]>([]);

  const queryParams = new URLSearchParams("=");
  const router = useRouter();

  const sortChats = useCallback(async () => {
    if (allChats && allChats.length <= 0) {
      return;
    }

    const dateToday = new Date();
    const dateYesterday = subDays(dateToday, 1);
    const datePastWeek = subDays(dateToday, 8);

    const sortedArr: ISortedChats[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Past week", chats: [] },
      { label: "Older", chats: [] },
    ];

    // TODO could skip the find logic if refactored with an object
    allChats?.forEach((chat) => {
      if (isToday(chat.updatedAt)) {
        sortedArr.find((group) => group.label == "Today")?.chats.push(chat);
      } else if (isBefore(dateYesterday, chat.updatedAt)) {
        sortedArr.find((group) => group.label == "Yesterday")?.chats.push(chat);
      } else if (isBefore(datePastWeek, chat.updatedAt)) {
        sortedArr.find((group) => group.label == "Past week")?.chats.push(chat);
      } else {
        sortedArr.find((group) => group.label == "Older")?.chats.push(chat);
      }
    });

    setSortedChats(sortedArr);
  }, [allChats]);

  useEffect(() => {
    if (allChats) {
      sortChats();
    }
  }, [allChats, sortChats]);

  const handleClick = (selectedChatSlug: string) => {
    setSlug(selectedChatSlug);
    queryParams.append("slug", selectedChatSlug);
    router.push(`/chat/${selectedChatSlug}`, { scroll: false });
  };

  const handleNewChat = () => {
    if (currentUser) {
      router.replace("/chat", { scroll: false });
    } else {
      toast.error("Please sign in to create a new chat.");
    }
  };
  const handleHome = () => {
    router.push(`/`, { scroll: false });
  };

  return (
    <div className={`${hidden ? "pr-0" : "sm:pr-[288px]"} relative`}>
      {/* Show/Hide Button */}
      <button
        onClick={() => setHidden(!hidden)}
        className={`px-2 py-1 h-11 w-11 m-3 shadow-md shadow-gray-800 fixed cursor-pointer rounded-full bg-blue-1 hover:bg-blue-2 ${
          hidden ? "ml-3" : "ml-[18.5rem]"
        }`}
      >
        {hidden ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
      </button>
      <div
        className={`${
          hidden ? "hidden" : "flex"
        } flex-col h-full min-w-[288px] bg-gray-800 fixed z-40 transition-all duration-1000 delay-500`}
      >
        {/* Chat History List */}
        <div
          className={`flex flex-col pt-2 pb-4 hover:overflow-y-scroll scrollbar-thumb-blue-5 overflow-hidden w-72 ${
            sortedChats?.length === 0 ? "my-auto" : "items-start justify-start mb-auto"
          }`}
        >
          <nav
            className="mt-5 flex-1 px-2 bg-gray-800 space-y-1"
            aria-label="Sidebar"
            data-testid="chatnav"
          >
            {sortedChats?.length === 0 && (
              <div className="flex items-center justify-center px-4 w-full h-full">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-700 relative mb-24" />
                <p className="text-center text-gray-300 font-medium text-md absolute px-2">
                  {allChats == null
                    ? "Your chat history could not be fetched, please try again later."
                    : "Your chat history is empty. Start a new conversation to see it here!"}
                </p>
              </div>
            )}
            {sortedChats.length > 0 &&
              sortedChats.map((group) => {
                if (group.chats.length <= 0) return null;

                return (
                  <div key={group.label} className="">
                    <h2 className="text-gray-200 text-sm font-semibold px-1">
                      {group.label}
                    </h2>
                    {group.chats.map((chat) => (
                      <div key={chat.id}>
                        <div
                          onClick={() => handleClick(chat.slug)}
                          className={`text-gray-300 hover:bg-gray-700 hover:text-white
      group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer space-x-2 w-[268px]
      ${slug == chat.slug ? "bg-gray-600 text-gray-100" : "bg-gray-800"}`}
                        >
                          <p className="truncate text-ellipsis">{chat.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
          </nav>
        </div>
        {/* New Chat & Home */}
        <div className="flex-shrink-0 bg-gray-700 p-4 justify-between border-t-2 border-gray-500">
          <div className="flex justify-start flex-row gap-4">
            {/* <div className="flex-none border py-2 px-2 rounded-md"> */}
            <button onClick={handleHome}>
              <div className="flex-none bg-gray-500 hover:bg-gray-400 py-2 px-2 rounded-md cursor-pointer">
                <HomeIcon className="h-7 w-7 text-gray-200" />
              </div>
            </button>
            <button className="flex-grow" onClick={handleNewChat}>
              <div className="flex flex-row gap-1 items-center justify-center border border-gray-200 hover:bg-blue-2 py-2 pr-2 px-1 rounded-md font-semibold text-md cursor-pointer">
                <PlusIcon className="h-6 w-6 text-gray-100" />
                <p className="text-gray-200">New Chat</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatNav;
