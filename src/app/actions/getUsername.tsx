// import prisma from "@/app/libs/prismadb";
import { useSession } from "next-auth/react";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const GetUsername = async () => {
  const { data: session, status } = useSession();
  const sessionEmail = session?.user?.email as string;

  if (status == "authenticated") {
    const user = await prisma.user.findUnique({
      where: {
        email: sessionEmail,
      },
      select: {
        name: true,
      },
    });
    const username = user?.name;

    return username;
  }
};

export default GetUsername;
