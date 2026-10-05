import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';
const router = Router();
// Read lecture by ID
router.get('/lectures/:lectureId', authenticate, (req, res) => timetableController.getLecture(req, res));
// Read lecture audit history
router.get('/lectures/:lectureId/history', authenticate, (req, res) => timetableController.getHistory(req, res));
// Cancel lecture (Teacher of lecture, or Admin)
router.post('/lectures/:lectureId/cancel', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => timetableController.cancelLecture(req, res));
// Reschedule lecture (Teacher of lecture, or Admin)
router.post('/lectures/:lectureId/reschedule', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => timetableController.rescheduleLecture(req, res));
// Change room (Teacher of lecture, or Admin)
router.post('/lectures/:lectureId/change-room', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => timetableController.changeRoom(req, res));
// Change teacher / Assign substitute (Teacher of lecture, or Admin)
router.post('/lectures/:lectureId/change-teacher', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => timetableController.changeTeacher(req, res));
// Extra lecture (Teacher or Admin)
router.post('/lectures/extra', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => timetableController.createExtraLecture(req, res));
// Delete lecture (Admin only)
router.delete('/lectures/:lectureId', authenticate, requireRole(UserRole.ADMIN), (req, res) => timetableController.deleteLecture(req, res));
export default router;
