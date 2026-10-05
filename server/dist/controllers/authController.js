import { authService } from '../services/authService.js';
import { validateLoginInput, validateChangePasswordInput, } from '../validators/authValidators.js';
export class AuthController {
    /**
     * POST /api/v1/auth/login
     */
    async login(req, res) {
        const validation = validateLoginInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({
                error: 'Bad Request',
                message: validation.error,
            });
            return;
        }
        const { identifier, password, requestedRole } = req.body;
        try {
            const result = await authService.login(identifier, password, requestedRole);
            // Set HTTP-only secure cookie for refresh token
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
            });
            res.status(200).json(result);
        }
        catch (err) {
            // Do not reveal whether user exists or password was wrong
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }
    }
    /**
     * GET /api/v1/auth/me
     */
    async me(req, res) {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }
        try {
            const user = await authService.getMe(req.user.id);
            res.status(200).json(user || req.user);
        }
        catch {
            res.status(200).json(req.user);
        }
    }
    /**
     * POST /api/v1/auth/refresh
     */
    async refresh(req, res) {
        const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;
        if (!rawToken || typeof rawToken !== 'string') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Refresh token is required via request body or HTTP-only cookie',
            });
            return;
        }
        try {
            const result = await authService.refresh(rawToken);
            // Rotate cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            res.status(200).json(result);
        }
        catch (err) {
            res.status(401).json({
                error: 'Unauthorized',
                message: err.message || 'Invalid refresh token',
            });
        }
    }
    /**
     * POST /api/v1/auth/logout
     */
    async logout(req, res) {
        const token = req.body?.refreshToken || req.cookies?.refreshToken;
        try {
            if (token) {
                await authService.logout(token);
            }
            res.clearCookie('refreshToken', { path: '/' });
            res.status(200).json({
                message: 'Logged out successfully',
            });
        }
        catch {
            res.clearCookie('refreshToken', { path: '/' });
            res.status(200).json({
                message: 'Logged out successfully',
            });
        }
    }
    /**
     * POST /api/v1/auth/change-password
     */
    async changePassword(req, res) {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }
        const validation = validateChangePasswordInput(req.body);
        if (!validation.isValid) {
            res.status(400).json({
                error: 'Bad Request',
                message: validation.error,
            });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        try {
            await authService.changePassword(req.user.id, currentPassword, newPassword);
            res.status(200).json({
                message: 'Password changed successfully',
            });
        }
        catch (err) {
            res.status(400).json({
                error: 'Bad Request',
                message: err.message || 'Failed to change password',
            });
        }
    }
    /**
     * GET /api/v1/auth/test
     * Protected development endpoint demonstrating auth middleware
     */
    async testAuth(req, res) {
        if (!req.user) {
            res.status(401).json({ authenticated: false });
            return;
        }
        res.status(200).json({
            authenticated: true,
            userId: req.user.id,
            identifier: req.user.identifier,
            role: req.user.role,
        });
    }
}
export const authController = new AuthController();
