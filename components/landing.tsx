"use client";

import Image from "next/image";

export const Landing = () => {
  return (
    // <Suspense fallback={<LoadingComponent />}>
    <div className="pt-[64px] md:pt-0 mx-40">
      <div className="flex flex-row min-h-screen items-center justify-center bg-light-green">
        {/* <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-x-8 bg-gray-100 rounded-2xl m-6 md:m-0 p-10"> */}
        <div className="max-w-md max-h-md flex flex-col items-center justify-center mx-10 my-20 sm:max-w-2xl">
          <h2 className="text-4xl sm:text-5xl text-blue-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </h2>
          <h3 className="mt-4 text-xl font-medium text-gray-200 sm:mt-3">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sapiente
            animi quod non! Ducimus dolores maiores autem, a laudantium,
            corporis repellendus dolore esse corrupti.
          </h3>
          <button className="mt-10 bg-blue-0 px-3 py-3 rounded-xl text-blue-3 font-medium text-xl hover:bg-blue-1 transition-bg-color duration-300">
            <a href="/chat">Start now</a>
          </button>
        </div>
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="b" gradientTransform="rotate(-45 .5 .5)">
              <stop offset="0%" stop-color="#16425B" />
              <stop offset="100%" stop-color="#81C3D7" />
            </linearGradient>
            <clipPath id="a">
              <path
                fill="currentColor"
                d="M802 617q-68 117-185 228t-276.5 42.5q-159.5-68.5-168-228t23-296q31.5-136.5 168-160t238 35q101.5 58.5 185 160T802 617Z"
              />
            </clipPath>
          </defs>
          <g clip-path="url(#a)">
            <path
              fill="url(#b)"
              d="M802 617q-68 117-185 228t-276.5 42.5q-159.5-68.5-168-228t23-296q31.5-136.5 168-160t238 35q101.5 58.5 185 160T802 617Z"
            />
          </g>
        </svg>
        {/* <Image
              src={aboutPhoto}
              className="h-[26rem] sm:h-[32rem] w-[32rem] object-cover rounded-lg relative"
              alt="Photo for about page"
            /> */}
        {/* </div> */}
      </div>
    </div>
    // </Suspense>
  );
};
