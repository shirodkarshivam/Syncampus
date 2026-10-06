import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { ENV } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers (configured for cross-origin frontend-backend communication)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    const normalized = origin.trim().replace(/\/$/, '');
    return (
      ENV.ALLOWED_ORIGINS.includes(normalized) ||
      ENV.ALLOWED_ORIGINS.includes('*') ||
      normalized.endsWith('.vercel.app') ||
      normalized.includes('localhost') ||
      normalized.includes('127.0.0.1')
    );
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Test-Role', 'x-test-role', 'X-Test-Identifier', 'x-test-identifier'],
    })
  );

  // Cookie and Body Parsing
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API Routes (Mounted under /api)
  app.use('/api', routes);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
    });
  });

  // Global Centralized Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Application Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: ENV.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
};

export default createApp();
