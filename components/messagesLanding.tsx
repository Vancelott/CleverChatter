"use client";
import "src/app/globals.css";
import { Montserrat } from "next/font/google";
import { Variants, motion, useInView, stagger } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatedText } from "./animatedText";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const MessagesLanding = () => {
  // const ref = useRef(null);
  // const isInView = useInView(ref, { amount: 0.5 });

  const userMessage =
    "Hey, I'm working on a repository crawler project, and I need some interesting questions to test its capabilities. Can you help me out?";

  const aiMessage = `Absolutely! 🚀 Your repository crawler project sounds fascinating. Here are a few engaging questions to put it to the test: 1. "How does your crawler handle repositories with a large number of branches?" 2. "Can it accurately identify and classify different file types within a repository?" 3. "What strategies does it use to handle complex nested directory structures?" 4. "How well does it adapt to changes in the structure of a repository over time?" 5. "Can your crawler efficiently extract metadata, such as license information, from various code files?" Feel free to ask for more specific questions tailored to your project's needs!`;

  const userMessageArr = Array.from(userMessage);
  const aiMessageArr = Array.from(aiMessage);

  // const [aiMessageArr, setAiMessageArr] = useState<string[]>([]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     const aiMessageArr = Array.from(aiMessage);
  //     setAiMessageArr(aiMessageArr);
  //   }, 4800);
  // }, [aiMessage]);

  return (
    // <Suspense fallback={<LoadingComponent />}>
    <div className="xl:px-28">
      <div className="flex flex-row gap-4 min-h-screen items-center justify-between overflow-x-hidden py-52">
        {/* <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-x-8 bg-gray-100 rounded-2xl m-6 md:m-0 p-10"> */}
        {aiMessageArr.length > 0 && (
          <div className="w-full px-4 py-6 bg-blue-0 text-white rounded-3xl text-xl place-self-end">
            {aiMessageArr.map((char, index) => (
              <motion.span
                key={index}
                className="inline-block whitespace-break-spaces"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.035,
                  delay: index * 0.035,
                }}
                whileInView="animate"
                viewport={{
                  once: true,
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        )}
        <div className="w-full px-4 py-6 bg-blue-1 text-white rounded-3xl text-xl place-self-start">
          {userMessageArr.map((char, index) => (
            <motion.span
              key={index}
              className="inline-block whitespace-break-spaces"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.035, delay: index * 0.035 }}
              whileInView="animate"
              viewport={{
                once: true,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
      {/* <Image
              src={aboutPhoto}
              className="h-[26rem] sm:h-[32rem] w-[32rem] object-cover rounded-lg relative"
              alt="Photo for about page"
            /> */}
      {/* </div> */}
    </div>
    // </Suspense>
  );
};
