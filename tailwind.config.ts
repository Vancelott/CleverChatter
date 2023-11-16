import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // I added blue-00 at a later stage, otherwise it would've followed the naming pattern
        "blue-00": "#081821",
        "blue-0": "#16425B",
        "blue-1": "#2F6690",
        "blue-2": "#3A7CA5",
        "blue-3": "#81C3D7",
        "blue-4": "#64B5CE",
        "white-0": "#D9DCD6",
      },
    },
    fontFamily: {
      sans: ["Montserrat)"],
    },
  },
  plugins: [],
};
export default config;
