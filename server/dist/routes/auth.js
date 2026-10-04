import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { UserRole } from '@prisma/client';
const router = Router();
// Public Authentication Routes
router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
// Authenticated Routes
router.get('/me', authenticate, (req, res) => authController.me(req, res));
router.post('/change-password', authenticate, (req, res) => authController.changePassword(req, res));
router.get('/test', authenticate, (req, res) => authController.testAuth(req, res));
// RBAC Role Verification Test Endpoints
router.get('/admin-only', authenticate, requireRole(UserRole.ADMIN), (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Welcome to admin route',
        user: req.user,
    });
});
router.get('/teacher-only', authenticate, requireRole(UserRole.TEACHER, UserRole.ADMIN), (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Welcome to teacher route',
        user: req.user,
    });
});
export default router;
