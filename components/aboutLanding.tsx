"use client";

import {
  QuestionMarkCircleIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const features = [
  {
    name: "How it works",
    description:
      "CleverChatter is designed to empower developers by harnessing the capabilities of the GitHub API and Hugging Face's powerful models. Our chatbot analyzes the code from your repositories and generates insightful questions that you might encounter in a technical interview.",
    icon: QuestionMarkCircleIcon,
  },
  {
    name: "Secure conversations",
    description:
      "At the core of our service is a commitment to security and privacy. We understand the sensitivity of your code and the importance of maintaining a secure environment. Rest assured, our AI chatbot operates with the utmost respect for data integrity and confidentiality.",
    icon: LockClosedIcon,
  },
  {
    name: "Code with Confidence",
    description:
      "Join a new era of coding interviews where preparation is effortless and personalized. Our AI chatbot is your secret weapon to confidently tackle any technical interview. Embrace innovation, stand out from the crowd, and take your coding journey to the next level.",
    icon: GlobeAltIcon,
  },
];
export default function AboutLanding() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <div className="flex items-center justify-center flex-col bg-blue-00 z-3 py-20 px-6">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <motion.dl
          variants={container}
          initial="hidden"
          viewport={{ once: true }}
          whileInView="show"
          className="space-y-10 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 "
        >
          {features.map((feature) => (
            <motion.div
              variants={item}
              key={feature.name}
              className="bg-blue-0 px-4 py-8 rounded-2xl"
            >
              <dt>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-2 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-5 text-lg leading-6 font-bold text-blue-5">
                  {feature.name}
                </p>
              </dt>
              <dd className="mt-2 text-base font-semibold text-gray-100">
                {feature.description}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </div>
  );
}
