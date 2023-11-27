import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { User as NextAuthUser } from "next-auth";
import { NextAuthUserWithStringId } from "../../../types";
import { authOptions } from "../../../../../auth";

const prisma = new PrismaClient();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
