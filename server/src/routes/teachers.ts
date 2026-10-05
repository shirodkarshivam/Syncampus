import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/teachers/me/timetable
 * Returns faculty member's assigned lecture schedule
 */
router.get(
  '/me/timetable',
  authenticate,
  requireRole(UserRole.TEACHER, UserRole.ADMIN),
  (req, res) => timetableController.getTeacherTimetable(req, res)
);

export default router;
