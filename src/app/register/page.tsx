"use client";

import { Suspense, useCallback, useState } from "react";
// import { XCircleIcon, EyeIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
// import LoadingComponent from "@/app/register/loading";
import { redirect } from "next/navigation";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const resetState = () => {
    setError(""),
      setEmailError(""),
      setPasswordError(""),
      setPasswordConfirmError(""),
      setNameError("");
  };

  const handleRegister = useCallback(async () => {
    try {
      resetState();
      setIsLoading(true);
      await axios.post("/api/register", {
        email,
        username,
        password,
        confirmPassword,
      });
    } catch (error: any) {
      setIsLoading(false);
      const { errorData } = error.response;
      const { data } = error.response.data;
    } finally {
      // check if there are any errors - if not the user will be logged in
      if (
        isLoading == false &&
        error.length < 1 &&
        emailError.length < 1 &&
        nameError.length < 1 &&
        passwordError.length < 1 &&
        passwordConfirmError.length < 1
      ) {
        // const data = { email, username, password, confirmPassword };
        // signIn("credentials", {
        //   ...data,
        //   redirect: true,
        //   callbackUrl: "/",
        // });
      }
    }
  }, [email, username, password, confirmPassword]);

  return (
    <div className="pt-[64px] md:pt-0">
      <div className="flex min-h-screen relative flex-col justify-center px-6 py-12 lg:px-8 bg-white-0">
        {/* <Suspense fallback={<LoadingComponent />}> */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-blue-0">
            Sign up
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {(emailError || passwordError || error || nameError) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* <XCircleIcon
                      className="h-5 w-5 text-red-400"
                      aria-hidden="true"
                    /> */}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    There were errors with your submission
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul role="list" className="list-disc pl-5 space-y-1">
                      {error && <li>{error}</li>}
                      {emailError && <li>{emailError}</li>}
                      {nameError && <li>{nameError}</li>}
                      {passwordError && <li>{passwordError}</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
              </div>
              <div className="mt-2">
                <div>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    id="email"
                    disabled={isLoading}
                    className={`block  w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 appearance-none ${
                      emailError
                        ? "rounded-md ring-inset-2 ring-2 ring-red-400"
                        : ""
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-british-green-2 sm:text-sm sm:leading-6`}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Username
                </label>
              </div>
              <div className="mt-2">
                <div>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`block  w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 appearance-none ${
                      nameError
                        ? "rounded-md ring-inset-2 ring-2 ring-red-400"
                        : ""
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-british-green-2 sm:text-sm sm:leading-6`}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2 relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className={`block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 appearance-none ${
                    passwordError || error
                      ? "rounded-md ring-inset-2 ring-2 ring-red-400"
                      : ""
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-british-green-2 sm:text-sm sm:leading-6`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center p-1"
                >
                  {/* <EyeIcon className="h-5 w-auto fill-gray-500" /> */}
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
              </div>
              <div>
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  required
                  className={`block  w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 appearance-none ${
                    passwordConfirmError
                      ? "rounded-md ring-inset-2 ring-2 ring-red-400"
                      : ""
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-british-green-2 sm:text-sm sm:leading-6`}
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className={`${
                  isLoading ? "cursor-not-allowed opacity-80" : ""
                } flex w-full justify-center rounded-md bg-blue-1 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-british-green-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-british-green-1`}
              >
                Sign up
              </button>
            </div>
          </div>
          <p
            className="mt-10 text-center text-sm text-gray-500"
            onClick={() => router.push("/signin")}
          >
            Already a member?
            <a className="cursor-pointer font-semibold leading-6 px-1 text-blue-2 text-ring-slate-500 hover:text-blue-0">
              Log in now
            </a>
          </p>
        </div>
        {/* </Suspense> */}
      </div>
    </div>
  );
}
