"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NavBar = () => {
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

  const [hidden, setHidden] = useState(true);

  // return (
  //   //   <span className="flex justify-center align-center w-full h-16 bg-white text-red-500">
  //   //     <Link href="/signin">signin</Link>
  //   //     <Link href="/register">register</Link>
  //   //   </span>
  //   <nav className="flex justify-center align-center w-full h-16 bg-gray-500">
  //     <div className="max-w-7xl mx-auto">
  //       <ul className="flex flex-row gap-4 space-between text-red-100">
  // {!sessionStatus && (
  //   <li>
  //     <Link href="/signin">signin</Link>
  //   </li>
  // )}
  // {sessionStatus && <p>Signed in</p>}
  //         <li>
  //           <Link href="/register">register</Link>
  //         </li>
  //       </ul>
  //     </div>
  //   </nav>
  // );

  return (
    <nav className="bg-gray-900 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between py-5 px-3">
          {/* Burger menu */}
          <div className="flex md:hidden">
            <p>Burger</p>
          </div>
          {/* Primary Nav/ Logo */}
          <div className="flex space-x-6 items-center">
            <div className=" text-blue-2 sm:mr-4 font-bold text-xl">Logo</div>
            <div className="hidden md:flex items-center space-x-6">
              <div>Home</div>
              <div>Pricing</div>
              <div>Contact us</div>
            </div>
          </div>
          {/* Secondary Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            {!sessionStatus && <div>Sign In</div>}
            {sessionStatus && <p>Signed in</p>}
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
