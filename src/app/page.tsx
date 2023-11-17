"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";
import { MessagesLanding } from "../../components/messagesLanding";

export default function Home() {
  return (
    <>
      <div className="bg-blue-00">
        <NavBar />
        <Landing />
        <div className="w-full mx-auto flex items-center justify-center">
          <p className="text-6xl font-extrabold max-w-4xl text-center">
            Getting ready for an interview has never been easier
          </p>
        </div>
        <div className="bg-gradient-to-t from-blue-4 to-blue-3 mx-32 my-28 rounded-3xl">
          <MessagesLanding />
        </div>
      </div>
    </>
  );
}
