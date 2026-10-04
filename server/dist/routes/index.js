import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
const router = Router();
// Base health endpoint: /api/health
router.use('/', healthRouter);
// Version 1 API routes: /api/v1/auth and /api/v1/users
router.use('/v1/auth', authRouter);
router.use('/v1/users', usersRouter);
export default router;
