import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
    var prisma: PrismaClient | undefined;
}

// Simple, standard Prisma initialization
// Prisma 7 requires passing at least an empty object
const prisma = global.prisma || new PrismaClient({});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
