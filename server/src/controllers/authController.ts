import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { otpService } from '../services/otpService.js';
import {
  validateLoginInput,
  validateChangePasswordInput,
  validateRefreshTokenInput,
} from '../validators/authValidators.js';

export class AuthController {
  /**
   * POST /api/v1/auth/request-otp
   */
  async requestOtp(req: Request, res: Response): Promise<void> {
    const { identifier, requestedRole } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Identifier (email, student ID, or teacher ID) is required.',
      });
      return;
    }

    try {
      const result = await otpService.requestOtp(identifier, requestedRole);
      if (!result.success) {
        res.status(result.status).json({
          error: result.message,
          message: result.error,
        });
        return;
      }

      res.status(result.status).json(result);
    } catch (err: any) {
      console.error('[AuthController] requestOtp error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Unable to process OTP request.',
      });
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { identifier, otp, requestedRole } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Identifier is required.',
      });
      return;
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: '6-digit OTP code is required.',
      });
      return;
    }

    try {
      const verification = await otpService.verifyOtp(identifier, otp, requestedRole);
      if (!verification.valid || !verification.user) {
        res.status(verification.status).json({
          error: 'Unauthorized',
          message: verification.error || 'Invalid OTP code.',
        });
        return;
      }

      // Generate session tokens and store in PostgreSQL
      const sessionResult = await authService.createSessionForUser(verification.user);

      // Set secure HTTP-only cookie
      res.cookie('refreshToken', sessionResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.status(200).json(sessionResult);
    } catch (err: any) {
      console.error('[AuthController] verifyOtp error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to complete authentication.',
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
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
    } catch (err: any) {
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
  async me(req: Request, res: Response): Promise<void> {
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
    } catch {
      res.status(200).json(req.user);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
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
    } catch (err: any) {
      res.status(401).json({
        error: 'Unauthorized',
        message: err.message || 'Invalid refresh token',
      });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    const token = req.body?.refreshToken || req.cookies?.refreshToken;

    try {
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch {
      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({
        message: 'Logged out successfully',
      });
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
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
    } catch (err: any) {
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
  async testAuth(req: Request, res: Response): Promise<void> {
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
