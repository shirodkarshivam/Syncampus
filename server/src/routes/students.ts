import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/students/me/timetable
 * Returns authenticated student's personalized division timetable
 */
router.get(
  '/me/timetable',
  authenticate,
  requireRole(UserRole.STUDENT),
  (req, res) => timetableController.getStudentTimetable(req, res)
);

export default router;
