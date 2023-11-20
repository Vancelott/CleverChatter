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
        <motion.div
          initial={{ opacity: 0, translateY: 150 }}
          animate={{ opacity: 1, translateY: 0 }}
          whileInView="animate"
          transition={{
            delay: 0.7,
          }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <MessagesLanding />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <StatsLanding />
        </motion.div>
      </div>
    </>
  );
}
