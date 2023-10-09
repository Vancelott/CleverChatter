"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";

export default function Home() {
  return (
    <>
      <div className="">
        <Landing />
      </div>
    </>
  );
}
