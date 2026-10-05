import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import timetableRouter from './timetable.js';
import studentsRouter from './students.js';
import teachersRouter from './teachers.js';
import divisionsRouter from './divisions.js';
import roomsRouter from './rooms.js';
import adminRouter from './admin.js';

const router = Router();

// Base health endpoint: /api/health
router.use('/', healthRouter);

// Version 1 API routes
router.use('/v1/auth', authRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/timetable', timetableRouter);
router.use('/v1/students', studentsRouter);
router.use('/v1/teachers', teachersRouter);
router.use('/v1/divisions', divisionsRouter);
router.use('/v1/rooms', roomsRouter);
router.use('/v1/admin', adminRouter);

export default router;
