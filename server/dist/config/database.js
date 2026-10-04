import { PrismaClient } from '@prisma/client';
export const isDbConfigured = Boolean(process.env.DATABASE_URL);
export const prisma = global.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
