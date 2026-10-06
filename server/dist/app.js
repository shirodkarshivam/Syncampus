import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { ENV } from './config/env.js';
export const createApp = () => {
    const app = express();
    // Security Headers
    app.use(helmet());
    // CORS Configuration
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (ENV.ALLOWED_ORIGINS.includes(origin) || ENV.ALLOWED_ORIGINS.includes('*')) {
                return callback(null, true);
            }
            return callback(new Error(`CORS error: Origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Test-Role', 'x-test-role', 'X-Test-Identifier', 'x-test-identifier'],
    }));
    // Cookie and Body Parsing
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    // API Routes (Mounted under /api)
    app.use('/api', routes);
    // 404 Handler
    app.use((_req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: 'The requested API endpoint does not exist',
        });
    });
    // Global Centralized Error Handler
    app.use((err, _req, res, _next) => {
        console.error('Unhandled Application Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: ENV.NODE_ENV === 'development' ? err.message : undefined,
        });
    });
    return app;
};
export default createApp();
