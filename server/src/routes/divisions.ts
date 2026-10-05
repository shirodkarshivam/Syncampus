import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * GET /api/v1/divisions/:divisionId/timetable
 * Returns timetable for specific division (enforces student restricted to own division)
 */
router.get(
  '/:divisionId/timetable',
  authenticate,
  (req, res) => timetableController.getDivisionTimetable(req, res)
);

export default router;
