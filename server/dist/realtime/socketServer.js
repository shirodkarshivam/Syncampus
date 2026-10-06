import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma, isDbConfigured } from '../config/database.js';
import { ENV } from '../config/env.js';
import { UserRole } from '@prisma/client';
let io = null;
/**
 * Resolves user from verified JWT payload using database or fallback store
 */
export async function resolveUserFromPayload(payload) {
    let user = null;
    if (isDbConfigured) {
        try {
            user = await prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            divisionId: true,
                            division: { select: { id: true, fullName: true } },
                        },
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
    if (!user)
        return null;
    return {
        id: user.id,
        email: user.email,
        identifier: user.identifier,
        role: user.role,
        student: user.student || null,
        teacher: user.teacher || null,
    };
}
/**
 * Initializes the Socket.IO server attached to the HTTP server
 */
export function initSocketServer(httpServer) {
    if (io) {
        return io;
    }
    io = new Server(httpServer, {
        cors: {
            origin: ENV.CORS_ORIGIN,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        pingTimeout: 20000,
        pingInterval: 25000,
    });
    // Socket.IO Authentication Middleware
    io.use(async (socket, next) => {
        let token = socket.handshake.auth?.token;
        if (!token && socket.handshake.headers?.authorization) {
            const parts = socket.handshake.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }
        if (!token) {
            if (!ENV.AUTH_ENABLED) {
                // Dev testing mode: resolve user by role
                const testRole = (socket.handshake.auth?.role || socket.handshake.headers['x-test-role'] || 'STUDENT').toUpperCase();
                let identifier = 'STU0001';
                let email = 'stu0001@sonopantcollege.edu.in';
                let role = UserRole.STUDENT;
                if (testRole === 'TEACHER') {
                    identifier = 'T001';
                    email = 'rahul.patil.t001@campus.edu';
                    role = UserRole.TEACHER;
                }
                else if (testRole === 'ADMIN') {
                    identifier = 'ADMIN01';
                    email = 'admin@campus.edu';
                    role = UserRole.ADMIN;
                }
                let user = null;
                if (isDbConfigured) {
                    try {
                        user = await prisma.user.findFirst({
                            where: { identifier },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        studentId: true,
                                        fullName: true,
                                        divisionId: true,
                                        division: { select: { id: true, fullName: true } },
                                    },
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
                    user = {
                        id: `dev-${identifier}`,
                        email,
                        identifier,
                        role,
                        student: role === UserRole.STUDENT
                            ? {
                                id: 'dev-stu-0001',
                                studentId: identifier,
                                fullName: 'Yash Pawar (Testing Mode)',
                                divisionId: 'BSc IT_FY_A',
                            }
                            : null,
                        teacher: role === UserRole.TEACHER
                            ? {
                                id: 'dev-teach-0001',
                                teacherId: identifier,
                                fullName: 'Prof. Rahul Patil (Testing Mode)',
                                departmentId: 'Science & Technology',
                            }
                            : null,
                    };
                }
                socket.data.user = user;
                socket.data.rooms = [];
                return next();
            }
            return next(new Error('AUTHENTICATION_REQUIRED'));
        }
        try {
            const payload = verifyAccessToken(token);
            const user = await resolveUserFromPayload(payload);
            if (!user) {
                return next(new Error('USER_NOT_FOUND'));
            }
            socket.data.user = user;
            socket.data.rooms = [];
            next();
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new Error('TOKEN_EXPIRED'));
            }
            return next(new Error('INVALID_TOKEN'));
        }
    });
    // Connection Handler & Server-Controlled Room Joining
    io.on('connection', (socket) => {
        const user = socket.data.user;
        const roomsToJoin = [];
        // 1. Direct User Notification Room
        const userRoom = `user:${user.id}`;
        socket.join(userRoom);
        roomsToJoin.push(userRoom);
        // 2. Role-specific Room Membership (Server-Enforced)
        if (user.role === 'STUDENT') {
            const divName = user.student?.division?.fullName || user.student?.divisionId;
            if (divName) {
                const divisionRoom = `division:${divName}`;
                socket.join(divisionRoom);
                roomsToJoin.push(divisionRoom);
            }
            if (user.student?.divisionId && user.student.divisionId !== divName) {
                socket.join(`division:${user.student.divisionId}`);
                roomsToJoin.push(`division:${user.student.divisionId}`);
            }
        }
        else if (user.role === 'TEACHER') {
            const teacherId = user.teacher?.teacherId || user.identifier;
            if (teacherId) {
                const teacherRoom = `teacher:${teacherId}`;
                socket.join(teacherRoom);
                roomsToJoin.push(teacherRoom);
            }
        }
        else if (user.role === 'ADMIN') {
            const adminRoom = 'admin';
            socket.join(adminRoom);
            roomsToJoin.push(adminRoom);
        }
        socket.data.rooms = roomsToJoin;
        console.log(`[Socket.IO] Authenticated ${user.role} "${user.identifier}" (${user.id}) connected. Rooms: [${roomsToJoin.join(', ')}]`);
        socket.on('disconnect', (reason) => {
            console.log(`[Socket.IO] ${user.role} "${user.identifier}" disconnected (${reason})`);
        });
    });
    return io;
}
/**
 * Returns the active Socket.IO server instance
 */
export function getIO() {
    return io;
}
/**
 * Closes the Socket.IO server (used in test cleanups)
 */
export function closeSocketServer() {
    return new Promise((resolve) => {
        if (io) {
            io.close(() => {
                io = null;
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
