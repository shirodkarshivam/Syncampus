import crypto from 'crypto';
import { prisma, isDbConfigured } from '../config/database.js';
import { UserRole } from '@prisma/client';
import { findFallbackUser } from '../data/authFallback.js';

interface OtpRecord {
  code: string;
  email: string;
  userId: string;
  role: UserRole;
  expiresAt: Date;
  attempts: number;
  lockedUntil?: Date;
}

// In-memory OTP registry keyed by normalized email
const activeOtps = new Map<string, OtpRecord>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export class OtpService {
  /**
   * Generates and registers a real, cryptographically random 6-digit OTP for an existing user.
   */
  async requestOtp(
    identifier: string,
    requestedRole?: string
  ): Promise<{
    success: boolean;
    message: string;
    email?: string;
    devCode?: string;
    error?: string;
    status: number;
  }> {
    const trimmedId = identifier.trim();
    const normalizedId = trimmedId.toLowerCase();

    // 1. Look up user account in PostgreSQL or fallback
    let user: any = null;

    if (isDbConfigured) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedId }, { identifier: trimmedId }],
        },
        include: {
          student: true,
          teacher: true,
        },
      });
    }

    if (!user) {
      user = findFallbackUser(trimmedId, requestedRole) || findFallbackUser(normalizedId, requestedRole);
    }

    if (!user) {
      return {
        success: false,
        error: 'No account registered with this email or ID. Please check your credentials.',
        status: 404,
        message: 'Account not found',
      };
    }

    // 2. Strict Role Verification
    if (requestedRole) {
      const normalizedRequested = requestedRole.toUpperCase();
      if (user.role !== normalizedRequested) {
        const roleLabel =
          user.role === 'STUDENT' ? 'Student' : user.role === 'TEACHER' ? 'Faculty/Teacher' : 'Administrator';
        return {
          success: false,
          error: `This account is registered as a ${roleLabel} account. Please use the appropriate login portal.`,
          status: 403,
          message: 'Role mismatch',
        };
      }
    }

    const emailKey = user.email.toLowerCase();

    // 3. Check for existing lockout
    const existing = activeOtps.get(emailKey);
    if (existing?.lockedUntil && existing.lockedUntil > new Date()) {
      const remainingMin = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${remainingMin} minutes before requesting a new code.`,
        status: 429,
        message: 'Account temporarily locked',
      };
    }

    // 4. Generate cryptographically random 6-digit OTP
    const rawCode = crypto.randomInt(100000, 1000000).toString();

    // 5. Invalidate previous OTP and store new one
    activeOtps.set(emailKey, {
      code: rawCode,
      email: user.email,
      userId: user.id,
      role: user.role,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      attempts: 0,
    });

    // Log to server console for testing/audit
    console.log(
      `[SyncCampus Auth] >> OTP Generated for ${user.email} (${user.role}): [${rawCode}] (Valid for 5 mins)`
    );

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      email: user.email,
      devCode: isDev ? rawCode : undefined,
      status: 200,
    };
  }

  /**
   * Verifies an OTP against stored state.
   */
  async verifyOtp(
    identifier: string,
    enteredOtp: string,
    requestedRole?: string
  ): Promise<{
    valid: boolean;
    user?: any;
    error?: string;
    status: number;
  }> {
    const trimmedId = identifier.trim();
    const normalizedId = trimmedId.toLowerCase();
    const cleanOtp = enteredOtp.trim();

    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return {
        valid: false,
        error: 'Please enter a valid 6-digit verification code.',
        status: 400,
      };
    }

    // Look up user
    let user: any = null;
    if (isDbConfigured) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedId }, { identifier: trimmedId }],
        },
        include: {
          student: true,
          teacher: true,
        },
      });
    }

    if (!user) {
      user = findFallbackUser(trimmedId, requestedRole) || findFallbackUser(normalizedId, requestedRole);
    }

    if (!user) {
      return {
        valid: false,
        error: 'Account not found.',
        status: 404,
      };
    }

    // Role check
    if (requestedRole) {
      const normalizedRequested = requestedRole.toUpperCase();
      if (user.role !== normalizedRequested) {
        return {
          valid: false,
          error: `This account is registered as a ${user.role} account.`,
          status: 403,
        };
      }
    }

    const emailKey = user.email.toLowerCase();
    const record = activeOtps.get(emailKey);

    if (!record) {
      return {
        valid: false,
        error: 'No active verification code found. Please request a new code.',
        status: 400,
      };
    }

    // Check lockout
    if (record.lockedUntil && record.lockedUntil > new Date()) {
      const remainingMin = Math.ceil((record.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      return {
        valid: false,
        error: `Account is temporarily locked due to repeated failed attempts. Please try again in ${remainingMin} minutes.`,
        status: 429,
      };
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      activeOtps.delete(emailKey);
      return {
        valid: false,
        error: 'Verification code has expired. Please request a new code.',
        status: 400,
      };
    }

    // Verify code match
    if (record.code !== cleanOtp) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;

      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        return {
          valid: false,
          error: 'Maximum verification attempts exceeded. Account locked for 15 minutes.',
          status: 429,
        };
      }

      return {
        valid: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        status: 401,
      };
    }

    // Successful verification: consume and invalidate OTP
    activeOtps.delete(emailKey);

    return {
      valid: true,
      user,
      status: 200,
    };
  }
}

export const otpService = new OtpService();
