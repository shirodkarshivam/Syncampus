import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
/**
 * Generates a short-lived access token.
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
        expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
    });
}
/**
 * Generates a long-lived refresh token.
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
        expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    });
}
/**
 * Verifies an access token and extracts payload.
 */
export function verifyAccessToken(token) {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
}
/**
 * Verifies a refresh token and extracts payload.
 */
export function verifyRefreshToken(token) {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
}
/**
 * Hashes a token using SHA-256 for secure database storage.
 */
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
