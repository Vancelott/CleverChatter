"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const {
    // data: session
    status: status,
  } = useSession();

  const [sessionStatus, setSessionStatus] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      setSessionStatus(true);
    }
  }, [status]);

  const [hidden, setHidden] = useState(true);

  // temporary
  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  return (
    <nav className="z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between py-5 px-3">
          {/* Burger menu */}
          <div className="flex md:hidden">
            <p>Burger</p>
          </div>
          {/* Primary Nav/ Logo */}
          <div className="flex space-x-6 items-center">
            <div className=" text-blue-2 sm:mr-4 font-bold text-xl">
              CleverChatter
            </div>
            <div className="text-white hidden md:flex items-center space-x-6 text-md font-semibold cursor-pointer">
              <div className="hover:text-blue-3">Home</div>
              <div className="hover:text-blue-3">Pricing</div>
              <div className="hover:text-blue-3">Contact us</div>
            </div>
          </div>
          {/* Secondary Nav */}
          <div className="hidden md:flex space-x-6 items-center font-medium">
            {!sessionStatus && <div>Sign In</div>}
            {sessionStatus && <p>Signed in</p>}
            {sessionStatus && (
              <button onClick={handleLogout} className="cursor-pointer">
                Log out
              </button>
            )}
            <div className="text-blue-3 font-semibold">Register</div>
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => {
              hidden === true ? setHidden(false) : setHidden(true);
            }}
            // onClick={() => setHidden(false)}
            className="md:hidden flex items-center"
          >
            Mobile
          </button>
          {/* mobile menu */}
        </div>
        <div
          className={hidden ? `hidden` : `flex md:hidden flex-col border-t-2`}
        >
          <a className="block py-2 px-4 text-sm hover:text-gray-300">Home</a>
          <a className="block py-2 px-4 text-sm hover:text-gray-300">Pricing</a>
          <a className="block py-2 px-4 text-sm hover:text-gray-300">
            Contact us
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
