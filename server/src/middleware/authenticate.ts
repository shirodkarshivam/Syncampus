import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { prisma, isDbConfigured } from '../config/database.js';
import { ENV } from '../config/env.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  identifier: string;
  role: UserRole;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    divisionId: string;
  } | null;
  teacher?: {
    id: string;
    teacherId: string;
    fullName: string;
    departmentId: string;
  } | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  // In development testing mode when authentication is disabled
  if (!ENV.AUTH_ENABLED && (!authHeader || !authHeader.startsWith('Bearer '))) {
    const testRole = ((req.headers['x-test-role'] || 'STUDENT') as string).toUpperCase();
    const testIdentifier = req.headers['x-test-identifier'] as string | undefined;
    let identifier = testIdentifier || 'STU0001';
    let email = 'stu0001@sonopantcollege.edu.in';
    let role: UserRole = UserRole.STUDENT;

    if (testRole === 'TEACHER') {
      identifier = testIdentifier || 'T001';
      email = 'rahul.patil.t001@campus.edu';
      role = UserRole.TEACHER;
    } else if (testRole === 'ADMIN') {
      identifier = testIdentifier || 'ADMIN01';
      email = 'admin@campus.edu';
      role = UserRole.ADMIN;
    }

    let user: any = null;
    if (isDbConfigured) {
      try {
        user = await prisma.user.findFirst({
          where: { identifier },
          include: {
            student: { select: { id: true, studentId: true, fullName: true, divisionId: true } },
            teacher: { select: { id: true, teacherId: true, fullName: true, departmentId: true } },
          },
        });
      } catch {
        user = null;
      }
    }

    if (!user) {
      user = {
        id: `dev-${identifier}`,
        email,
        identifier,
        role,
        student:
          role === UserRole.STUDENT
            ? {
                id: 'dev-stu-0001',
                studentId: identifier,
                fullName: 'Yash Pawar (Testing Mode)',
                divisionId: 'BSc IT_FY_A',
              }
            : null,
        teacher:
          role === UserRole.TEACHER
            ? {
                id: 'dev-teach-0001',
                teacherId: identifier,
                fullName: 'Prof. Rahul Patil (Testing Mode)',
                departmentId: 'Science & Technology',
              }
            : null,
      };
    }

    req.user = {
      id: user.id,
      email: user.email,
      identifier: user.identifier,
      role: user.role,
      student: user.student || null,
      teacher: user.teacher || null,
    };

    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token not provided',
    });
    return;
  }

  try {
    const payload: TokenPayload = verifyAccessToken(token);

    // Verify user exists in database
    let user: any = null;
    if (isDbConfigured) {
      try {
        user = await prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            student: {
              select: { id: true, studentId: true, fullName: true, divisionId: true },
            },
            teacher: {
              select: { id: true, teacherId: true, fullName: true, departmentId: true },
            },
          },
        });
      } catch {
        user = null;
      }
    }

    if (!user) {
      // In offline/mock mode, construct authenticated user from valid verified JWT payload and fallback lookup
      const { findFallbackUser } = await import('../data/authFallback.js');
      const fb = findFallbackUser(payload.identifier) || findFallbackUser(payload.sub);
      user = {
        id: payload.sub,
        email: payload.email,
        identifier: payload.identifier,
        role: payload.role,
        student: fb?.role === 'STUDENT' ? {
          id: fb.id,
          studentId: fb.identifier,
          fullName: fb.name,
          divisionId: fb.division || '',
        } : null,
        teacher: fb?.role === 'TEACHER' ? {
          id: fb.id,
          teacherId: fb.identifier,
          fullName: fb.name,
          departmentId: fb.department || '',
        } : null,
      };
    }

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authenticated user no longer exists',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      identifier: user.identifier,
      role: user.role,
      student: user.student || null,
      teacher: user.teacher || null,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization token',
    });
    return;
  }
}
