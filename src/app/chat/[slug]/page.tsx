"use client";

import { useSearchParams } from "next/navigation";

interface Messages {
  userReq: string[];
  aiRes: string[];
}

export default function Slug({ messages }: { messages: Messages | null }) {
  // const searchParams = useSearchParams();

  return (
    <>
      <div className="px-4 mx-auto flex items-center justify-center flex-col">
        <div className="text-white font-bold text-xl text-center">Logo</div>
        {messages?.userReq.map((item: any) => (
          <li key={item}>{item}</li>
        ))}
      </div>
    </>
  );
}
