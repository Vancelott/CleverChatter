import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthContext from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Montserrat } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleverChatter",
  description:
    "AI-powered GitHub repository crawler for technical interview prep, generating insightful questions from project code.",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthContext>
        <body>
          <div className="flex flex-col h-screen justify-between font-montserrat">
            <Toaster position="top-center" />
            {children}
          </div>
        </body>
      </AuthContext>
    </html>
  );
}
