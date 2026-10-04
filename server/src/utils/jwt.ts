import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  sub: string;       // User ID
  role: UserRole;    // STUDENT | TEACHER | ADMIN
  identifier: string;// Student ID, Teacher ID, or ADMIN01
  email: string;
}

/**
 * Generates a short-lived access token.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
  });
}

/**
 * Generates a long-lived refresh token.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
  });
}

/**
 * Verifies an access token and extracts payload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verifies a refresh token and extracts payload.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Hashes a token using SHA-256 for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
