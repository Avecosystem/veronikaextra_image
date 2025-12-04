import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
    var prisma: PrismaClient | undefined;
}

// Explicitly configure Prisma for Node.js (library engine)
// Pass datasourceUrl to avoid "client" engine type error
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = global.prisma || new PrismaClient({
    datasourceUrl: databaseUrl
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
