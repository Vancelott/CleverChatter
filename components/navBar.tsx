"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { User } from "@/app/types";
import Image from "next/image";
import { useProfileStore } from "@/app/store";
import cleverchatterLogo from "public/cleverchatterLogo.png";
// import cleverchatter from "public/cleverchatter.svg";

const NavBar = ({ currentUser }: { currentUser: User }) => {
  const { hideProfile, setHideProfile } = useProfileStore();

  const { status: status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(currentUser);
  const [sessionStatus, setSessionStatus] = useState(false);
  const [hiddenNav, setHiddenNav] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // function to close the profile menu when clicked outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setHideProfile(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  useEffect(() => {
    if (status === "authenticated") {
      setSessionStatus(true);
    }
  }, [status]);

  const handleLogin = () => {
    setIsLoading(true);
    signIn("github", { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Logged in!");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleTestLogin = () => {
    setIsLoading(true);
    signIn("github", {
      name: `${process.env.GITHUB_TEST_NAME}`,
      email: `${process.env.GITHUB_TEST_EMAIL}`,
      username: `${process.env.GITHUB_TEST_USERNAME}`,
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Logged in!");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const navBarVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0.3 },
  };

  const mobileNavVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0.7 },
  };

  const buttonVariants = {
    open: { scale: 1, y: 0 },
    closed: { scale: 1.15, easeIn: 1.5, y: 2 },
  };

  return (
    <nav className="z-20 bg-blue-00">
      <div className="max-w-7xl mx-auto md:px-6">
        <div className="flex flex-row-reverse justify-between py-5 px-6">
          {/* Profile Menu */}
          <div className="flex">
            <div className="relative h-10 w-10" ref={profileRef}>
              <button
                onClick={() => setHideProfile(!hideProfile)}
                className="focus:outline-none focus:ring focus:ring-blue-5 rounded-full transition delay-75"
              >
                {user?.image ? (
                  <Image
                    src={user.image as string}
                    width={48}
                    height={48}
                    className="rounded-full"
                    alt="User profile image"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-white" />
                )}
              </button>
              <motion.div
                variants={navBarVariants}
                animate={hideProfile ? "closed" : "open"}
                className={`${
                  hideProfile
                    ? "hidden"
                    : "flex flex-col items-center justify-center gap-y-4 p-6 w-64 sm:w-80 bg-gray-800  mt-1 rounded-xl absolute right-0 z-10"
                }`}
              >
                {!sessionStatus && (
                  <>
                    <button
                      onClick={handleLogin}
                      className="flex items-center w-full justify-center gap-4 text-center bg-blue-2 p-2 rounded-lg text-md font-semibold"
                    >
                      <svg
                        className="fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Login with Github
                    </button>
                    <button
                      onClick={handleTestLogin}
                      className="flex items-center w-full justify-center text-center bg-blue-2 py-2 px-4 gap-4 rounded-lg text-md font-semibold"
                    >
                      Login with a Test account
                    </button>
                  </>
                )}
                {sessionStatus && (
                  <>
                    <div className="flex gap-2 items-center justify-start bg-slate-700 py-2 px-4 rounded-2xl w-full">
                      <p className="text-white-0 font-medium text-lg whitespace-nowrap">
                        Welcome, {user.username}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full justify-center text-center bg-blue-2 py-2 px-4 gap-4 rounded-lg text-md font-semibold"
                    >
                      Log out
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
          {/* Primary Nav/ Logo */}
          <div className="flex space-x-6 items-center">
            <a
              href="/"
              className="text-blue-2 sm:mr-4 font-bold text-xl max-w-[10rem] max-h-[10rem]"
            >
              <Image src={cleverchatterLogo} alt="Logo" className="" />
            </a>
            {/* <div className="text-white hidden md:flex items-center space-x-6 text-md font-semibold cursor-pointer">
              <a href="/services" className="hover:text-blue-3">
                Services
              </a>
              <a className="hover:text-blue-3">Contact us</a>
              <a className="hover:text-blue-3">About</a>
            </div> */}
          </div>
          {/* Mobile menu button */}
          {/* <motion.button
            onClick={() => {
              hiddenNav === true ? setHiddenNav(false) : setHiddenNav(true);
            }}
            className="flex items-center md:hidden"
            variants={buttonVariants}
            animate={hiddenNav ? "closed" : "open"}
          >
            {hiddenNav ? (
              <Bars3Icon className="h-9 w-9 text-white transform transition-transform delay-200 pl-3" />
            ) : (
              <Bars2Icon className="h-9 w-9 text-white transform transition-transform delay-200 pl-3" />
            )}
          </motion.button> */}
          {/* Mobile burger menu */}
        </div>
        {/* <motion.div
          variants={mobileNavVariants}
          animate={hiddenNav ? "closed" : "open"}
          className={
            hiddenNav
              ? `hidden`
              : `flex w-full md:hidden flex-col border-t-1 gap-2 py-2 px-4 text-md font-bold bg-gray-800`
          }
        >
          <a
            href="/services"
            className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
          >
            Services
          </a>
          <a className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
            Contact us
          </a>
          <a className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
            About
          </a>
        </motion.div> */}
      </div>
    </nav>
  );
};

export default NavBar;
