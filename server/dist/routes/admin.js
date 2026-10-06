import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';
const router = Router();
// Protect all admin endpoints with authentication and ADMIN role check
const adminAuth = [authenticate, requireRole(UserRole.ADMIN)];
/**
 * GET /api/v1/admin/timetable
 * Returns master timetable filtered by criteria
 */
router.get('/timetable', ...adminAuth, (req, res) => timetableController.getMasterTimetable(req, res));
// Teacher CRUD
router.get('/teachers', ...adminAuth, (req, res) => adminController.getTeachers(req, res));
router.post('/teachers', ...adminAuth, (req, res) => adminController.createTeacher(req, res));
router.delete('/teachers/:id', ...adminAuth, (req, res) => adminController.deleteTeacher(req, res));
// Student CRUD
router.get('/students', ...adminAuth, (req, res) => adminController.getStudents(req, res));
router.post('/students', ...adminAuth, (req, res) => adminController.createStudent(req, res));
router.delete('/students/:id', ...adminAuth, (req, res) => adminController.deleteStudent(req, res));
// Classroom / Room CRUD
router.get('/rooms', ...adminAuth, (req, res) => adminController.getRooms(req, res));
router.post('/rooms', ...adminAuth, (req, res) => adminController.createRoom(req, res));
router.delete('/rooms/:id', ...adminAuth, (req, res) => adminController.deleteRoom(req, res));
// Department CRUD
router.get('/departments', ...adminAuth, (req, res) => adminController.getDepartments(req, res));
router.post('/departments', ...adminAuth, (req, res) => adminController.createDepartment(req, res));
router.delete('/departments/:id', ...adminAuth, (req, res) => adminController.deleteDepartment(req, res));
// Division CRUD
router.get('/divisions', ...adminAuth, (req, res) => adminController.getDivisions(req, res));
router.post('/divisions', ...adminAuth, (req, res) => adminController.createDivision(req, res));
export default router;
