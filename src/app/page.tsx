"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";

export default function Home() {
  return (
    <>
      <div className="bg-blue-00">
        <NavBar />
        <Landing />
      </div>
    </>
  );
}
