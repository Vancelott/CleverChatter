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
        "diagonal-strips": `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316425b' fill-opacity='0.25' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E") ;`,
      },
      colors: {
        // I added blue-00 at a later stage, otherwise it would've followed the naming pattern
        "blue-00": "#081821",
        "blue-0": "#16425B",
        "blue-1": "#2F6690",
        "blue-2": "#3A7CA5",
        "blue-3": "#81C3D7",
        "blue-4": "#64B5CE",
        "blue-5": "#A3D3E1",
        "white-0": "#D9DCD6",
      },
    },
    fontFamily: {
      // sans: ["Montserrat"],
      montserrat: ["Montserrat", "sans-serif"],
    },
  },
  plugins: [],
};
export default config;
