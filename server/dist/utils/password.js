import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';
/**
 * Hashes a plaintext password using bcrypt with configured cost factor.
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, ENV.BCRYPT_ROUNDS);
}
/**
 * Compares a plaintext password against a stored bcrypt hash.
 */
export async function comparePassword(password, hash) {
    if (!password || !hash)
        return false;
    return bcrypt.compare(password, hash);
}
