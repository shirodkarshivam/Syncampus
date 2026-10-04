import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authService } from '../services/authService.js';
const router = Router();
/**
 * GET /api/v1/users/me
 * Returns the current authenticated user's isolated profile.
 */
router.get('/me', authenticate, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const profile = await authService.getMe(req.user.id);
        res.status(200).json(profile || req.user);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});
export default router;
