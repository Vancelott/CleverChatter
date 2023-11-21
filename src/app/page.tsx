"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";
import { MessagesLanding } from "../../components/messagesLanding";
import StatsLanding from "../../components/statsLanding";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <div className="bg-blue-00">
        <NavBar />
        <Landing />
        <MessagesLanding />
        <StatsLanding />
      </div>
    </>
  );
}
