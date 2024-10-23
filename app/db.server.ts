import { PrismaClient } from "@prisma/client";

// Declare Prisma Client globally to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
const prisma: PrismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "development") {
  global.prisma = prisma;  // In development, reuse the same Prisma instance
}

export default prisma;
