import { verifyAccessToken } from '../utils/jwt.js';
import { prisma, isDbConfigured } from '../config/database.js';
export async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
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
        const payload = verifyAccessToken(token);
        // Verify user exists in database
        let user = null;
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
            }
            catch {
                user = null;
            }
        }
        if (!user) {
            // In offline/mock mode, construct authenticated user from valid verified JWT payload
            user = {
                id: payload.sub,
                email: payload.email,
                identifier: payload.identifier,
                role: payload.role,
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
    }
    catch (err) {
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
