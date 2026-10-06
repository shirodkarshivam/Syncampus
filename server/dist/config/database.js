import { PrismaClient } from '@prisma/client';
export const isDbConfigured = Boolean(process.env.DATABASE_URL);
export const prisma = global.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
/**
 * Verifies that the PostgreSQL database is reachable when DATABASE_URL is configured.
 * Throws a fatal error if connection fails, preventing silent fallback.
 */
export async function verifyDatabaseConnection() {
    if (isDbConfigured) {
        try {
            await prisma.$queryRaw `SELECT 1`;
            console.log('[Database] PostgreSQL connection verified and active.');
        }
        catch (err) {
            console.error('[Database] FATAL: PostgreSQL connection failed while DATABASE_URL is set:', err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        }
    }
}
