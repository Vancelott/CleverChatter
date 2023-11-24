import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";
import { MessagesLanding } from "../../components/messagesLanding";
import StatsLanding from "../../components/statsLanding";
import { motion } from "framer-motion";

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <>
      <div className="bg-blue-00">
        <NavBar currentUser={currentUser!} />
        <Landing />
        <MessagesLanding />
        <StatsLanding />
      </div>
    </>
  );
}
