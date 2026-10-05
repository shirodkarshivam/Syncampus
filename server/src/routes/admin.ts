import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/admin/timetable
 * Returns master timetable filtered by criteria (restricted to administrators)
 */
router.get(
  '/timetable',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res) => timetableController.getMasterTimetable(req, res)
);

export default router;
