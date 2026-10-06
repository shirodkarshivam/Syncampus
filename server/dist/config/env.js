import dotenv from 'dotenv';
dotenv.config();
function parseAllowedOrigins() {
    const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];
    const customOrigins = [];
    if (process.env.FRONTEND_URL) {
        customOrigins.push(...process.env.FRONTEND_URL.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean));
    }
    if (process.env.CORS_ORIGIN) {
        customOrigins.push(...process.env.CORS_ORIGIN.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean));
    }
    return Array.from(new Set([...defaults, ...customOrigins]));
}
export const ENV = {
    PORT: process.env.PORT || '5000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_syncampus_jwt_access_secret_key_2026_minimum_32_chars',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_syncampus_jwt_refresh_secret_key_2026_minimum_32_chars',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    ALLOWED_ORIGINS: parseAllowedOrigins(),
    AUTH_ENABLED: process.env.AUTH_ENABLED !== 'false',
};
