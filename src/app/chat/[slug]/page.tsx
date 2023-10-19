"use client";

import GetMessages from "@/app/actions/getMessages";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// interface Messages {
//   userReq: string[];
//   aiRes: string[];
// }

interface Messages {
  id: string;
  messageId: string;
  messageContent: string;
  createdAt: Date;
}

export default function Slug({ params }: { params: { slug: string } }) {
  const [slug] = useState(params.slug);
  // const [messages, setMessages] = useState<Messages | null>();
  const [userMessages, setUserMessages] = useState<Messages[]>();
  const [aiMessages, setAiMessages] = useState<Messages[]>();
  // const [combinedMessages, setCombinedMessages] = useState([messages]);

  // const test = combinedMessages.map((item, index) => (
  //   <div key={index}>
  //     <p>{item?.userReq[index]}</p>
  //     <p>{item?.aiRes[index]}</p>
  //   </div>
  // ));

  useEffect(() => {
    GetMessages(slug).then((data) => {
      setUserMessages(data?.UserMessages), setAiMessages(data?.AiMessages);
    });
  }, [slug]);

  const orderedMessages = userMessages?.map((userMessage: Messages) => {
    const equalAiMessageId = aiMessages?.find(
      (aiMessage: Messages) => aiMessage.messageId === userMessage.messageId
    );

    return (
      <div key={userMessage.id}>
        <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-2">
          {userMessage.messageContent}
        </p>
        <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
          {equalAiMessageId?.messageContent}
        </p>
      </div>
    );
  });

  return (
    <>
      <div className="px-4 mx-auto flex flex-col max-w-6xl">
        <div className="flex justify-start flex-col">
          {/* {userMessages?.map(
            (userMessage: Messages, index = +userMessage.id) =>
              aiMessages?.map(
                (aiMessage: Messages, index = +userMessage.messageId) => (
                  <div key={}>
                    <p className="px-4 py-6 bg-blue-0 text-white rounded-3xl my-2">
                      {userMessage.messageContent}
                    </p>
                    <p className="px-4 py-6 bg-blue-1 text-white rounded-3xl">
                      {aiMessage.messageContent}
                    </p>
                  </div>
                )
              )
          )} */}
          <div>{orderedMessages}</div>
          {/* {aiMessages?.map((item: Messages, index = +item.messageId) => (
            <p key={item.id}>{item.messageContent}</p>
          ))} */}
          {/* {combinedMessages.map((item, index) => (
            <p
              key={index}
              className={`text-left py-6 px-4 bg-cyan-500 m-4 rounded-2xl ${
                index % 2 ? "bg-slate-400" : "bg-cyan-500"
              } `}
            >
              {item}
            </p>
          ))} */}
        </div>
      </div>
    </>
  );
}
