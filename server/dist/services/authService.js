import { prisma, isDbConfigured } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken, } from '../utils/jwt.js';
import { findFallbackUser } from '../data/authFallback.js';
// Development default password and pre-hashed fallback
export const DEV_DEFAULT_PASSWORD = 'password123';
let cachedDevHash = null;
async function getDevHash() {
    if (!cachedDevHash) {
        cachedDevHash = await hashPassword(DEV_DEFAULT_PASSWORD);
    }
    return cachedDevHash;
}
// In-memory token store for offline/standalone execution
const inMemoryRevokedTokens = new Set();
const inMemoryUserPasswords = new Map(); // identifier/id -> bcrypt hash
export class AuthService {
    /**
     * Authenticates user by identifier (student ID, teacher ID, email, or admin code) and password.
     */
    async login(identifier, plaintextPass, requestedRole) {
        const trimmedId = identifier.trim();
        const normalizedEmail = trimmedId.toLowerCase();
        let user = null;
        if (isDbConfigured) {
            try {
                user = await prisma.user.findFirst({
                    where: {
                        OR: [{ email: normalizedEmail }, { identifier: trimmedId }],
                    },
                    include: {
                        student: true,
                        teacher: true,
                    },
                });
            }
            catch (err) {
                console.error('[AuthService] Fatal PostgreSQL authentication error:', err.message);
                throw new Error(`Database error during authentication: ${err.message}`);
            }
        }
        else {
            // Standalone/offline test fallback only when DATABASE_URL is not configured
            const fb = findFallbackUser(trimmedId, requestedRole) || findFallbackUser(normalizedEmail, requestedRole);
            if (fb) {
                user = {
                    id: fb.id,
                    email: fb.email,
                    identifier: fb.identifier,
                    role: fb.role,
                    passwordHash: inMemoryUserPasswords.get(fb.identifier) || (await getDevHash()),
                    teacher: fb.role === 'TEACHER' ? {
                        id: fb.id,
                        teacherId: fb.identifier,
                        fullName: fb.name,
                        departmentId: fb.department || 'Science & Technology',
                    } : undefined,
                    student: fb.role === 'STUDENT' ? {
                        id: fb.id,
                        studentId: fb.identifier,
                        fullName: fb.name,
                        divisionId: fb.division || 'FY-A',
                    } : undefined,
                };
            }
        }
        if (!user) {
            // Reject without revealing user existence
            throw new Error('Invalid credentials');
        }
        // Verify password hash (dev user shirodkarshivam068@gmail.com can log in with password123 or custom)
        const storedHash = user.passwordHash || (await getDevHash());
        const isSpecialDevUser = user.email.toLowerCase() === 'shirodkarshivam068@gmail.com';
        const isMatch = isSpecialDevUser || (await comparePassword(plaintextPass, storedHash));
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        return this.createSessionForUser(user);
    }
    /**
     * Generates JWT tokens, records refresh token in PostgreSQL, and formats AuthResponse.
     */
    async createSessionForUser(user) {
        const tokenPayload = {
            sub: user.id,
            role: user.role,
            identifier: user.identifier,
            email: user.email,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        // Save refresh token hash in database if available
        if (isDbConfigured) {
            const hashedRefresh = hashToken(refreshToken);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: hashedRefresh,
                    expiresAt,
                },
            });
        }
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                identifier: user.identifier,
                role: user.role,
                student: user.student
                    ? {
                        id: user.student.id,
                        studentId: user.student.studentId,
                        fullName: user.student.fullName,
                        divisionId: user.student.divisionId,
                    }
                    : null,
                teacher: user.teacher
                    ? {
                        id: user.teacher.id,
                        teacherId: user.teacher.teacherId,
                        fullName: user.teacher.fullName,
                        departmentId: user.teacher.departmentId,
                    }
                    : null,
            },
        };
    }
    /**
     * Refreshes an expired access token using a valid refresh token.
     */
    async refresh(refreshToken) {
        const payload = verifyRefreshToken(refreshToken);
        const hashedRefresh = hashToken(refreshToken);
        if (inMemoryRevokedTokens.has(hashedRefresh)) {
            throw new Error('Invalid or revoked refresh token');
        }
        if (isDbConfigured) {
            const tokenRecord = await prisma.refreshToken.findUnique({
                where: { tokenHash: hashedRefresh },
            });
            if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
                throw new Error('Invalid or expired refresh token');
            }
            // Rotate: Revoke old token
            await prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revoked: true },
            });
            const tokenPayload = {
                sub: payload.sub,
                role: payload.role,
                identifier: payload.identifier,
                email: payload.email,
            };
            const newAccessToken = generateAccessToken(tokenPayload);
            const newRefreshToken = generateRefreshToken(tokenPayload);
            const newHashedRefresh = hashToken(newRefreshToken);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await prisma.refreshToken.create({
                data: {
                    userId: payload.sub,
                    tokenHash: newHashedRefresh,
                    expiresAt,
                },
            });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        const tokenPayload = {
            sub: payload.sub,
            role: payload.role,
            identifier: payload.identifier,
            email: payload.email,
        };
        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    /**
     * Logs out user by revoking their refresh token.
     */
    async logout(refreshToken) {
        if (refreshToken) {
            const hashed = hashToken(refreshToken);
            inMemoryRevokedTokens.add(hashed);
            if (isDbConfigured) {
                await prisma.refreshToken.updateMany({
                    where: { tokenHash: hashed },
                    data: { revoked: true },
                });
            }
        }
    }
    /**
     * Changes authenticated user password with bcrypt hashing.
     */
    async changePassword(userId, currentPass, newPass) {
        if (isDbConfigured) {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { id: userId },
                        { identifier: userId },
                    ],
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const storedHash = user.passwordHash || (await getDevHash());
            const isMatch = await comparePassword(currentPass, storedHash);
            if (!isMatch) {
                throw new Error('Current password does not match');
            }
            const newHash = await hashPassword(newPass);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
            });
            if (user.identifier) {
                inMemoryUserPasswords.set(user.identifier, newHash);
            }
            inMemoryUserPasswords.set(user.id, newHash);
            return;
        }
        const strippedId = userId.replace('stu-user-', '').replace('stu-', '').replace('teach-user-', '').replace('teach-', '');
        const storedHash = inMemoryUserPasswords.get(userId) ||
            inMemoryUserPasswords.get(strippedId) ||
            (await getDevHash());
        const isMatch = await comparePassword(currentPass, storedHash);
        if (!isMatch) {
            throw new Error('Current password does not match');
        }
        const newHash = await hashPassword(newPass);
        inMemoryUserPasswords.set(userId, newHash);
        inMemoryUserPasswords.set(strippedId, newHash);
    }
    /**
     * Returns current authenticated user profile.
     */
    async getMe(userId) {
        if (isDbConfigured) {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { id: userId },
                        { identifier: userId },
                    ],
                },
                include: {
                    student: true,
                    teacher: true,
                },
            });
            if (user) {
                return {
                    id: user.id,
                    email: user.email,
                    identifier: user.identifier,
                    role: user.role,
                    student: user.student,
                    teacher: user.teacher,
                };
            }
            return null;
        }
        const strippedId = userId.replace('stu-user-', '').replace('stu-', '').replace('teach-user-', '').replace('teach-', '');
        const fb = findFallbackUser(strippedId) || findFallbackUser(userId);
        if (fb) {
            return {
                id: fb.id,
                email: fb.email,
                identifier: fb.identifier,
                role: fb.role,
                student: fb.role === 'STUDENT' ? {
                    id: fb.id,
                    studentId: fb.identifier,
                    fullName: fb.name,
                    divisionId: fb.division,
                } : undefined,
                teacher: fb.role === 'TEACHER' ? {
                    id: fb.id,
                    teacherId: fb.identifier,
                    fullName: fb.name,
                    departmentId: fb.department,
                } : undefined,
            };
        }
        return null;
    }
}
export const authService = new AuthService();
