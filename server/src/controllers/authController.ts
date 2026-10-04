import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import {
  validateLoginInput,
  validateChangePasswordInput,
  validateRefreshTokenInput,
} from '../validators/authValidators.js';

export class AuthController {
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

    const { identifier, password } = req.body;

    try {
      const result = await authService.login(identifier, password);
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
    const validation = validateRefreshTokenInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
      return;
    }

    try {
      const result = await authService.refresh(req.body.refreshToken);
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
    try {
      await authService.logout(req.body?.refreshToken);
      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch {
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
