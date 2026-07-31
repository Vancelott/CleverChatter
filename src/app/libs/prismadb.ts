import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const prismadb = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = prismadb.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") prismadb.prisma = prisma;
