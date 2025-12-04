import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
    var prisma: PrismaClient | undefined;
}

// Prisma 7 requires explicit datasource URL
const prisma = global.prisma || new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db'
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
