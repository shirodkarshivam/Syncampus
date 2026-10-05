import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/rooms/:roomId/timetable
 * Returns room occupancy schedule (restricted to faculty and administration)
 */
router.get(
  '/:roomId/timetable',
  authenticate,
  requireRole(UserRole.TEACHER, UserRole.ADMIN),
  (req, res) => timetableController.getRoomTimetable(req, res)
);

export default router;
