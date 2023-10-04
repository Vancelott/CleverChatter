"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const NavBar = () => {
  const {
    // data: session
    status: status,
  } = useSession();

  const [sessionStatus, setSessionStatus] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setSessionStatus(true);
    }
  }, [status]);

  return (
    //   <span className="flex justify-center align-center w-full h-16 bg-white text-red-500">
    //     <Link href="/signin">signin</Link>
    //     <Link href="/register">register</Link>
    //   </span>
    <nav className="flex justify-center align-center w-full h-16 bg-gray-900">
      <ul className="flex flex-row gap-4 space-between text-red-100">
        {!sessionStatus && (
          <li>
            <Link href="/signin">signin</Link>
          </li>
        )}
        {sessionStatus && <p>Signed in</p>}
        <li>
          <Link href="/register">register</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
