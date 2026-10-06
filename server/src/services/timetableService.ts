import { prisma, isDbConfigured } from '../config/database.js';
import { conflictService, DAY_NUMBER_MAP, PERIOD_TIME_MAP, LectureConflictCandidate } from './conflictService.js';
import { AuthenticatedUser } from '../middleware/authenticate.js';
import { eventPublisher } from '../realtime/eventPublisher.js';
import { createRequire } from 'module';
import { LectureStatus } from '@prisma/client';

import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

function loadJsonSafe(relPath: string, fileName: string): any[] {
  try {
    return require(relPath);
  } catch {
    try {
      const candidates = [
        path.resolve(process.cwd(), 'src', 'data', fileName),
        path.resolve(process.cwd(), 'dist', 'data', fileName),
        path.resolve(process.cwd(), 'data', fileName),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          return JSON.parse(fs.readFileSync(p, 'utf8'));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }
}

const MASTER_TIMETABLE: any[] = loadJsonSafe('../data/masterTimetable.json', 'masterTimetable.json');
const INITIAL_CLASSROOMS: any[] = loadJsonSafe('../data/classrooms.json', 'classrooms.json');
const TEACHERS_DATA: any[] = loadJsonSafe('../data/teachers.json', 'teachers.json');

export interface TimetableFilters {
  department?: string;
  course?: string;
  academicYear?: string;
  division?: string;
  teacher?: string;
  room?: string;
  day?: string;
  period?: number;
  status?: string;
}

export interface TimetableChangeRecord {
  id: string;
  lectureId: string;
  changedByUserId: string;
  changedByRole: string;
  changeType: 'CANCELLATION' | 'RESCHEDULE' | 'ROOM_CHANGE' | 'TEACHER_CHANGE';
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  reason: string;
  createdAt: string;
}

export interface RescheduleParams {
  dayOfWeek: number;
  periodNumber: number;
  startTime?: string;
  endTime?: string;
  reason: string;
}

export interface ChangeRoomParams {
  roomId: string;
  reason?: string;
}

export interface ChangeTeacherParams {
  teacherId: string;
  reason?: string;
}

export interface ExtraLectureParams {
  subjectId: string;
  divisionId: string;
  teacherId: string;
  roomId: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export class TimetableError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;

  constructor(statusCode: number, errorCode: string, message: string, details?: any) {
    super(message);
    this.name = 'TimetableError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

// In-Memory Fallback Store Initialization
let inMemoryLectures: any[] = [];
let inMemoryChanges: TimetableChangeRecord[] = [];
let isStoreInitialized = false;

// Async Mutex for Race Condition Protection in fallback mode
class AsyncMutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise(resolve => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) next();
        } else {
          this.locked = false;
        }
      };

      if (!this.locked) {
        this.locked = true;
        resolve(release);
      } else {
        this.queue.push(() => resolve(release));
      }
    });
  }
}

const timetableMutex = new AsyncMutex();

function initializeFallbackStore(): void {
  if (isStoreInitialized && inMemoryLectures.length > 0) return;

  const dayNumberMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
  };

  const periodMap: Record<string, number> = {
    '09:00 - 10:00': 1,
    '10:00 - 11:00': 2,
    '11:00 - 12:00': 3,
    '01:00 - 02:00': 4,
    '02:00 - 03:00': 5,
  };

  inMemoryLectures = MASTER_TIMETABLE.map(l => {
    const times = l.time.split(' - ');
    const periodNumber = periodMap[l.time] || 1;
    const dayOfWeek = dayNumberMap[l.day] || 1;

    return {
      id: l.id,
      divisionId: l.divisionKey,
      divisionKey: l.divisionKey,
      course: l.course,
      year: l.year,
      division: l.division,
      department: l.department,
      subjectId: `sub-${l.course}-${l.subject}`,
      subjectName: l.subject,
      teacherId: l.teacherId,
      teacherName: l.teacherName,
      roomId: l.classroom,
      roomName: l.classroom,
      dayOfWeek,
      dayName: l.day,
      periodNumber,
      startTime: times[0] || '09:00',
      endTime: times[1] || '10:00',
      status: l.status.toUpperCase() === 'SCHEDULED' ? 'SCHEDULED' : l.status.toUpperCase(),
      originalTeacherId: l.teacherId,
      originalRoomId: l.classroom,
      originalDay: l.day,
      originalStartTime: times[0] || '09:00',
      originalEndTime: times[1] || '10:00',
      cancellationReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  inMemoryChanges = [];
  isStoreInitialized = true;
}

/**
 * Normalizes PostgreSQL lecture records with relational properties into the standard API contract
 */
export function formatDbLecture(l: any) {
  const divName = l.division?.fullName || l.divisionId || '';
  const parts = divName ? divName.split('_') : [];
  const course = l.division?.course?.name || parts[0] || '';
  const year = l.division?.academicYear || parts[1] || '';
  const division = l.division?.divisionName || parts[2] || '';
  const department = l.division?.course?.department?.name || 'Science & Technology';

  return {
    id: l.id,
    divisionId: l.division?.fullName || l.divisionId,
    divisionKey: l.division?.fullName || l.divisionId,
    course,
    year,
    division,
    department,
    subjectId: l.subject?.code || l.subjectId,
    subjectName: l.subject?.name || '',
    teacherId: l.teacher?.teacherId || l.teacherId,
    teacherName: l.teacher?.fullName || '',
    roomId: l.room?.roomCode || l.roomId,
    roomName: l.room?.roomName || l.room?.roomCode || l.roomId,
    dayOfWeek: l.dayOfWeek,
    dayName: l.dayName,
    periodNumber: l.periodNumber,
    startTime: l.startTime,
    endTime: l.endTime,
    status: l.status,
    originalTeacherId: l.originalTeacher?.teacherId || l.originalTeacherId || l.teacher?.teacherId,
    originalRoomId: l.originalRoom?.roomCode || l.originalRoomId || l.room?.roomCode,
    originalStartTime: l.originalStartTime || l.startTime,
    originalEndTime: l.originalEndTime || l.endTime,
    originalDay: l.originalDay || l.dayName,
    cancellationReason: l.cancellationReason || null,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
    history:
      l.auditLogs?.map((a: any) => ({
        id: a.id,
        lectureId: a.lectureId,
        changedByUserId: a.changedByUserId,
        changeType: a.changeType,
        oldValues: a.oldValues,
        newValues: a.newValues,
        reason: a.reason,
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      })) || [],
    subject: l.subject,
    teacher: l.teacher,
    divisionDetails: l.division,
    room: l.room,
  };
}

export class TimetableService {
  constructor() {
    initializeFallbackStore();
  }

  /**
   * Resets the in-memory store and restores PostgreSQL to pristine 1,275 original scheduled lectures.
   */
  async resetToOriginalTimetable(): Promise<void> {
    isStoreInitialized = false;
    initializeFallbackStore();

    if (isDbConfigured) {
      await this.restorePostgresLectures();
    }
  }

  /**
   * Restores pristine lecture records and cleans up extra/deleted sessions in PostgreSQL
   */
  async restorePostgresLectures(): Promise<void> {
    if (!isDbConfigured) return;

    try {
      // 1. Delete extra lectures
      await prisma.lecture.deleteMany({
        where: { id: { startsWith: 'lec-extra' } },
      });

      // 2. Ensure lec-1 exists and is reset to SCHEDULED
      const lec1 = MASTER_TIMETABLE.find(l => l.id === 'lec-1');
      if (lec1) {
        const div = await prisma.division.findFirst({ where: { fullName: lec1.divisionKey } });
        const teacher = await prisma.teacher.findFirst({ where: { teacherId: lec1.teacherId } });
        const room = await prisma.room.findFirst({
          where: { OR: [{ roomCode: lec1.classroom }, { roomName: lec1.classroom }, { id: lec1.classroom }] },
        });
        const sub = await prisma.subject.findFirst({ where: { name: lec1.subject } });

        if (div && teacher && room && sub) {
          await prisma.lecture.upsert({
            where: { id: 'lec-1' },
            update: {
              divisionId: div.id,
              subjectId: sub.id,
              teacherId: teacher.id,
              roomId: room.id,
              dayOfWeek: 1,
              dayName: 'Monday',
              periodNumber: 1,
              startTime: '09:00',
              endTime: '10:00',
              status: LectureStatus.SCHEDULED,
              cancellationReason: null,
            },
            create: {
              id: 'lec-1',
              divisionId: div.id,
              subjectId: sub.id,
              teacherId: teacher.id,
              roomId: room.id,
              dayOfWeek: 1,
              dayName: 'Monday',
              periodNumber: 1,
              startTime: '09:00',
              endTime: '10:00',
              status: LectureStatus.SCHEDULED,
            },
          });
        }
      }

      // 3. Clear audit logs for lec-1 to keep it pristine
      await prisma.timetableChange.deleteMany({
        where: { lectureId: 'lec-1' },
      });
    } catch (e: any) {
      console.error('[TimetableService] Error in restorePostgresLectures:', e.message);
    }
  }

  /**
   * Returns candidates for conflict engine checking
   */
  private getConflictCandidates(): LectureConflictCandidate[] {
    return inMemoryLectures.map(l => ({
      id: l.id,
      teacherId: l.teacherId,
      teacherName: l.teacherName,
      roomId: l.roomId,
      roomName: l.roomName,
      divisionId: l.divisionId,
      divisionName: l.divisionKey,
      dayOfWeek: l.dayOfWeek,
      periodNumber: l.periodNumber,
      subjectName: l.subjectName,
      status: l.status,
    }));
  }

  /**
   * GET single lecture with full relational metadata and audit history
   */
  async getLectureById(lectureId: string): Promise<any> {
    if (isDbConfigured) {
      const dbLecture = await prisma.lecture.findUnique({
        where: { id: lectureId },
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (dbLecture) {
        return formatDbLecture(dbLecture);
      }
      throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
    }

    initializeFallbackStore();
    const lecture = inMemoryLectures.find(l => l.id === lectureId);
    if (!lecture) {
      throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
    }

    const history = inMemoryChanges.filter(c => c.lectureId === lectureId);
    return {
      ...lecture,
      history,
    };
  }

  /**
   * GET timetable for authenticated student
   */
  async getStudentTimetable(user: AuthenticatedUser): Promise<any[]> {
    if (user.role !== 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Access restricted to student accounts.');
    }

    const studentDiv = user.student?.divisionId;
    if (!studentDiv && !user.identifier) {
      throw new TimetableError(400, 'BAD_REQUEST', 'Student is not mapped to any division.');
    }

    if (isDbConfigured) {
      const division = await prisma.division.findFirst({
        where: {
          OR: [
            ...(studentDiv ? [{ id: studentDiv }, { fullName: studentDiv }, { fullName: studentDiv.replace(/_/g, '-') }] : []),
            ...(user.identifier ? [{ students: { some: { studentId: user.identifier } } }] : []),
          ],
        },
      });

      if (!division) {
        throw new TimetableError(400, 'BAD_REQUEST', 'Student division could not be resolved in database.');
      }

      const lectures = await prisma.lecture.findMany({
        where: { divisionId: division.id },
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      });

      return lectures.map(formatDbLecture);
    }

    initializeFallbackStore();
    const normalizedDiv = (studentDiv || '').trim();
    return inMemoryLectures.filter(
      l =>
        l.divisionId === normalizedDiv ||
        l.divisionKey === normalizedDiv ||
        normalizedDiv.includes(l.divisionKey) ||
        l.divisionKey.replace(/_/g, '-') === normalizedDiv
    );
  }

  /**
   * GET timetable for authenticated teacher
   */
  async getTeacherTimetable(user: AuthenticatedUser, requestedTeacherId?: string): Promise<any[]> {
    let targetTeacherId = '';
    if (user.role === 'ADMIN' && requestedTeacherId) {
      targetTeacherId = requestedTeacherId;
    } else if (user.role === 'TEACHER') {
      targetTeacherId = user.teacher?.teacherId || user.identifier;
    } else if (user.role === 'ADMIN') {
      targetTeacherId = requestedTeacherId || user.teacher?.teacherId || '';
    } else {
      throw new TimetableError(403, 'FORBIDDEN', 'Access restricted to faculty and administration.');
    }

    if (!targetTeacherId) {
      throw new TimetableError(400, 'BAD_REQUEST', 'Teacher identifier could not be resolved.');
    }

    if (isDbConfigured) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { teacherId: targetTeacherId },
            { id: targetTeacherId },
            { userId: user.id },
          ],
        },
      });

      if (!teacher) {
        return [];
      }

      const lectures = await prisma.lecture.findMany({
        where: { teacherId: teacher.id },
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      });

      return lectures.map(formatDbLecture);
    }

    initializeFallbackStore();
    return inMemoryLectures.filter(
      l => l.teacherId.toLowerCase() === targetTeacherId.toLowerCase()
    );
  }

  /**
   * GET timetable for specific division with strict role checks
   */
  async getDivisionTimetable(user: AuthenticatedUser, divisionId: string): Promise<any[]> {
    const cleanDivision = divisionId.trim();

    if (user.role === 'STUDENT') {
      const studentDiv = user.student?.divisionId || '';
      const isMatch =
        cleanDivision === studentDiv ||
        studentDiv.includes(cleanDivision) ||
        cleanDivision.replace(/_/g, '-') === studentDiv.replace(/_/g, '-');

      if (!isMatch) {
        throw new TimetableError(
          403,
          'FORBIDDEN',
          'Students are strictly restricted from viewing schedules of other divisions.'
        );
      }
    }

    if (isDbConfigured) {
      const division = await prisma.division.findFirst({
        where: {
          OR: [
            { fullName: cleanDivision },
            { fullName: cleanDivision.replace(/_/g, '-') },
            { id: cleanDivision },
          ],
        },
      });

      if (!division) {
        return [];
      }

      const lectures = await prisma.lecture.findMany({
        where: { divisionId: division.id },
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      });

      return lectures.map(formatDbLecture);
    }

    initializeFallbackStore();
    return inMemoryLectures.filter(
      l =>
        l.divisionId.toLowerCase() === cleanDivision.toLowerCase() ||
        l.divisionKey.toLowerCase() === cleanDivision.toLowerCase() ||
        l.divisionKey.replace(/_/g, '-').toLowerCase() === cleanDivision.toLowerCase()
    );
  }

  /**
   * GET room occupancy schedule
   */
  async getRoomTimetable(user: AuthenticatedUser, roomId: string): Promise<any[]> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students do not have permission to query room occupancy.');
    }

    const cleanRoom = roomId.trim();

    if (isDbConfigured) {
      const room = await prisma.room.findFirst({
        where: {
          OR: [
            { roomCode: cleanRoom },
            { roomName: cleanRoom },
            { id: cleanRoom },
          ],
        },
      });

      if (!room) {
        throw new TimetableError(404, 'NOT_FOUND', `Classroom ${cleanRoom} does not exist in master records.`);
      }

      const lectures = await prisma.lecture.findMany({
        where: { roomId: room.id },
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      });

      return lectures.map(formatDbLecture);
    }

    initializeFallbackStore();
    return inMemoryLectures.filter(
      l => l.roomId.toLowerCase() === cleanRoom.toLowerCase() || l.roomName.toLowerCase() === cleanRoom.toLowerCase()
    );
  }

  /**
   * GET master timetable with optional multi-criteria filters (ADMIN only)
   */
  async getMasterTimetable(user: AuthenticatedUser, filters: TimetableFilters = {}): Promise<any[]> {
    if (user.role !== 'ADMIN') {
      throw new TimetableError(403, 'FORBIDDEN', 'Access to master timetable is restricted to administrators.');
    }

    if (isDbConfigured) {
      const whereClause: any = {};

      if (filters.status) {
        whereClause.status = filters.status.toUpperCase();
      }
      if (filters.period) {
        whereClause.periodNumber = Number(filters.period);
      }
      if (filters.day) {
        whereClause.dayName = { equals: filters.day, mode: 'insensitive' };
      }
      if (filters.room) {
        whereClause.room = { roomCode: { equals: filters.room, mode: 'insensitive' } };
      }
      if (filters.teacher) {
        whereClause.teacher = { teacherId: { equals: filters.teacher, mode: 'insensitive' } };
      }
      if (filters.division || filters.course || filters.department || filters.academicYear) {
        whereClause.division = {};
        if (filters.division) {
          whereClause.division.divisionName = { equals: filters.division, mode: 'insensitive' };
        }
        if (filters.academicYear) {
          whereClause.division.academicYear = { equals: filters.academicYear, mode: 'insensitive' };
        }
        if (filters.course) {
          whereClause.division.course = { name: { contains: filters.course, mode: 'insensitive' } };
        }
      }

      const lectures = await prisma.lecture.findMany({
        where: whereClause,
        include: {
          subject: true,
          teacher: true,
          division: { include: { course: { include: { department: true } } } },
          room: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      });

      return lectures.map(formatDbLecture);
    }

    initializeFallbackStore();
    return inMemoryLectures.filter(l => {
      if (filters.department && l.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      if (filters.course && l.course.toLowerCase() !== filters.course.toLowerCase()) return false;
      if (filters.academicYear && l.year.toLowerCase() !== filters.academicYear.toLowerCase()) return false;
      if (filters.division && l.division.toLowerCase() !== filters.division.toLowerCase()) return false;
      if (filters.teacher && l.teacherId.toLowerCase() !== filters.teacher.toLowerCase()) return false;
      if (filters.room && l.roomId.toLowerCase() !== filters.room.toLowerCase()) return false;
      if (filters.day && l.dayName.toLowerCase() !== filters.day.toLowerCase()) return false;
      if (filters.period && l.periodNumber !== Number(filters.period)) return false;
      if (filters.status && l.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      return true;
    });
  }

  /**
   * CANCEL LECTURE
   * Protected with atomic transaction and rollback guarantee
   */
  async cancelLecture(lectureId: string, user: AuthenticatedUser, reason: string): Promise<any> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students cannot cancel lectures.');
    }

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const lecture = await tx.lecture.findUnique({
          where: { id: lectureId },
          include: {
            teacher: true,
            room: true,
            division: { include: { course: { include: { department: true } } } },
            subject: true,
          },
        });

        if (!lecture) {
          throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
        }

        if (user.role === 'TEACHER') {
          const teacherId = user.teacher?.teacherId || user.identifier;
          if (lecture.teacher.teacherId.toLowerCase() !== teacherId.toLowerCase() && lecture.teacher.userId !== user.id) {
            throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot cancel a lecture assigned to another teacher.');
          }
        }

        if (lecture.status === 'CANCELLED') {
          throw new TimetableError(422, 'UNPROCESSABLE_ENTITY', 'This lecture is already cancelled.');
        }

        const oldValues = {
          status: lecture.status,
          cancellationReason: lecture.cancellationReason,
        };

        const newValues = {
          status: 'CANCELLED',
          cancellationReason: reason.trim(),
        };

        const updated = await tx.lecture.update({
          where: { id: lectureId },
          data: {
            status: LectureStatus.CANCELLED,
            cancellationReason: reason.trim(),
          },
          include: {
            subject: true,
            teacher: true,
            division: { include: { course: { include: { department: true } } } },
            room: true,
          },
        });

        // Resolve user record for audit foreign key
        const userRec = await tx.user.findFirst({
          where: { OR: [{ id: user.id }, { identifier: user.identifier }] },
        });

        const changeRecord = await tx.timetableChange.create({
          data: {
            lectureId: lecture.id,
            changedByUserId: userRec?.id || null,
            changeType: 'CANCELLATION',
            oldValues,
            newValues,
            reason: reason.trim(),
          },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_cancelled',
          lectureId: lecture.id,
          divisionId: lecture.division.fullName,
          divisionKey: lecture.division.fullName,
          course: lecture.division.course.name,
          year: lecture.division.academicYear,
          division: lecture.division.divisionName,
          subjectName: lecture.subject.name,
          teacherId: lecture.teacher.teacherId,
          teacherName: lecture.teacher.fullName,
          roomId: lecture.room.roomCode,
          roomName: lecture.room.roomName,
          dayName: lecture.dayName,
          timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
          oldValue: `${lecture.dayName} • ${lecture.startTime} - ${lecture.endTime} (${lecture.room.roomName})`,
          newValue: 'Cancelled',
          reason: reason.trim(),
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Lecture cancelled successfully.',
          lecture: formatDbLecture(updated),
          changeRecord: {
            id: changeRecord.id,
            lectureId: changeRecord.lectureId,
            changedByUserId: changeRecord.changedByUserId,
            changedByRole: user.role,
            changeType: changeRecord.changeType,
            oldValues: changeRecord.oldValues,
            newValues: changeRecord.newValues,
            reason: changeRecord.reason,
            createdAt: changeRecord.createdAt.toISOString(),
          },
        };
      });

      // Synchronize in-memory mirror
      initializeFallbackStore();
      const inMem = inMemoryLectures.find(l => l.id === lectureId);
      if (inMem) {
        inMem.status = 'CANCELLED';
        inMem.cancellationReason = reason.trim();
        inMemoryChanges.push(finalResult.changeRecord);
      }

      // Publish realtime event ONLY after successful transaction commit
      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const release = await timetableMutex.acquire();
    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];
      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot cancel a lecture assigned to another teacher.');
        }
      }

      if (lecture.status === 'CANCELLED') {
        throw new TimetableError(422, 'UNPROCESSABLE_ENTITY', 'This lecture is already cancelled.');
      }

      const oldValues = { status: lecture.status, cancellationReason: lecture.cancellationReason };
      const newValues = { status: 'CANCELLED', cancellationReason: reason.trim() };

      lecture.status = 'CANCELLED';
      lecture.cancellationReason = reason.trim();
      lecture.updatedAt = new Date().toISOString();

      const changeRecord: TimetableChangeRecord = {
        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lectureId: lecture.id,
        changedByUserId: user.id,
        changedByRole: user.role,
        changeType: 'CANCELLATION',
        oldValues,
        newValues,
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
      };

      inMemoryChanges.push(changeRecord);

      await eventPublisher.publishEvent({
        eventType: 'timetable:lecture_cancelled',
        lectureId: lecture.id,
        divisionId: lecture.divisionId,
        divisionKey: lecture.divisionKey,
        course: lecture.course,
        year: lecture.year,
        division: lecture.division,
        subjectName: lecture.subjectName,
        teacherId: lecture.teacherId,
        teacherName: lecture.teacherName,
        roomId: lecture.roomId,
        roomName: lecture.roomName,
        dayName: lecture.dayName,
        timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
        oldValue: `${lecture.dayName} • ${lecture.startTime} - ${lecture.endTime} (${lecture.roomName})`,
        newValue: 'Cancelled',
        reason: reason.trim(),
        changedByRole: user.role,
        changedByUserId: user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Lecture cancelled successfully.',
        lecture,
        changeRecord,
      };
    } finally {
      release();
    }
  }

  /**
   * RESCHEDULE LECTURE
   * Validates period/day, executes conflict engine, updates within transaction
   */
  async rescheduleLecture(lectureId: string, user: AuthenticatedUser, params: RescheduleParams): Promise<any> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students cannot reschedule lectures.');
    }

    const targetDay = Number(params.dayOfWeek);
    const targetPeriod = Number(params.periodNumber);
    const slotInfo = PERIOD_TIME_MAP[targetPeriod];
    const targetDayName = DAY_NUMBER_MAP[targetDay];

    if (!slotInfo || !targetDayName) {
      throw new TimetableError(400, 'BAD_REQUEST', 'Invalid day of week or period number.');
    }

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const lecture = await tx.lecture.findUnique({
          where: { id: lectureId },
          include: {
            teacher: true,
            room: true,
            division: { include: { course: { include: { department: true } } } },
            subject: true,
          },
        });

        if (!lecture) {
          throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
        }

        if (user.role === 'TEACHER') {
          const teacherId = user.teacher?.teacherId || user.identifier;
          if (lecture.teacher.teacherId.toLowerCase() !== teacherId.toLowerCase() && lecture.teacher.userId !== user.id) {
            throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot reschedule a lecture assigned to another teacher.');
          }
        }

        if (lecture.status === 'CANCELLED') {
          throw new TimetableError(422, 'UNPROCESSABLE_ENTITY', 'Cannot reschedule a cancelled lecture without first reinstating it.');
        }

        // Run Conflict Engine against active database lectures
        const activeLectures = await tx.lecture.findMany({
          where: { status: { not: LectureStatus.CANCELLED } },
          include: { teacher: true, room: true, division: true, subject: true },
        });

        const candidates: LectureConflictCandidate[] = activeLectures.map(l => ({
          id: l.id,
          teacherId: l.teacher.teacherId,
          teacherName: l.teacher.fullName,
          roomId: l.room.roomCode,
          roomName: l.room.roomName,
          divisionId: l.division.fullName,
          divisionName: l.division.fullName,
          dayOfWeek: l.dayOfWeek,
          periodNumber: l.periodNumber,
          subjectName: l.subject.name,
          status: l.status,
        }));

        const conflictCheck = conflictService.checkAllConflicts({
          lectures: candidates,
          teacherId: lecture.teacher.teacherId,
          roomId: lecture.room.roomCode,
          divisionId: lecture.division.fullName,
          dayOfWeek: targetDay,
          periodNumber: targetPeriod,
          excludeLectureId: lecture.id,
        });

        if (conflictCheck.hasConflict) {
          const primary = conflictCheck.conflicts[0];
          throw new TimetableError(409, primary.type, primary.message, {
            conflicts: conflictCheck.conflicts,
            targetDay: targetDayName,
            targetPeriod,
            timeSlot: slotInfo.timeString,
          });
        }

        const oldValues = {
          dayOfWeek: lecture.dayOfWeek,
          dayName: lecture.dayName,
          periodNumber: lecture.periodNumber,
          startTime: lecture.startTime,
          endTime: lecture.endTime,
          status: lecture.status,
        };

        const newValues = {
          dayOfWeek: targetDay,
          dayName: targetDayName,
          periodNumber: targetPeriod,
          startTime: params.startTime || slotInfo.startTime,
          endTime: params.endTime || slotInfo.endTime,
          status: 'RESCHEDULED',
        };

        const updated = await tx.lecture.update({
          where: { id: lectureId },
          data: {
            dayOfWeek: targetDay,
            dayName: targetDayName,
            periodNumber: targetPeriod,
            startTime: params.startTime || slotInfo.startTime,
            endTime: params.endTime || slotInfo.endTime,
            status: LectureStatus.RESCHEDULED,
          },
          include: {
            subject: true,
            teacher: true,
            division: { include: { course: { include: { department: true } } } },
            room: true,
          },
        });

        const userRec = await tx.user.findFirst({
          where: { OR: [{ id: user.id }, { identifier: user.identifier }] },
        });

        const changeRecord = await tx.timetableChange.create({
          data: {
            lectureId: lecture.id,
            changedByUserId: userRec?.id || null,
            changeType: 'RESCHEDULE',
            oldValues,
            newValues,
            reason: params.reason.trim(),
          },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_rescheduled',
          lectureId: lecture.id,
          divisionId: lecture.division.fullName,
          divisionKey: lecture.division.fullName,
          course: lecture.division.course.name,
          year: lecture.division.academicYear,
          division: lecture.division.divisionName,
          subjectName: lecture.subject.name,
          teacherId: lecture.teacher.teacherId,
          teacherName: lecture.teacher.fullName,
          roomId: lecture.room.roomCode,
          roomName: lecture.room.roomName,
          dayName: targetDayName,
          timeSlot: `${updated.startTime} - ${updated.endTime}`,
          oldValue: `${oldValues.dayName} • ${oldValues.startTime} - ${oldValues.endTime}`,
          newValue: `${targetDayName} • ${updated.startTime} - ${updated.endTime}`,
          reason: params.reason.trim(),
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Lecture rescheduled successfully.',
          lecture: formatDbLecture(updated),
          changeRecord: {
            id: changeRecord.id,
            lectureId: changeRecord.lectureId,
            changedByUserId: changeRecord.changedByUserId,
            changedByRole: user.role,
            changeType: changeRecord.changeType,
            oldValues: changeRecord.oldValues,
            newValues: changeRecord.newValues,
            reason: changeRecord.reason,
            createdAt: changeRecord.createdAt.toISOString(),
          },
        };
      });

      // Synchronize in-memory mirror
      initializeFallbackStore();
      const inMem = inMemoryLectures.find(l => l.id === lectureId);
      if (inMem) {
        inMem.dayOfWeek = targetDay;
        inMem.dayName = targetDayName;
        inMem.periodNumber = targetPeriod;
        inMem.startTime = params.startTime || slotInfo.startTime;
        inMem.endTime = params.endTime || slotInfo.endTime;
        inMem.status = 'RESCHEDULED';
        inMemoryChanges.push(finalResult.changeRecord);
      }

      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const release = await timetableMutex.acquire();
    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];
      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot reschedule a lecture assigned to another teacher.');
        }
      }

      if (lecture.status === 'CANCELLED') {
        throw new TimetableError(422, 'UNPROCESSABLE_ENTITY', 'Cannot reschedule a cancelled lecture without first reinstating it.');
      }

      const conflictCheck = conflictService.checkAllConflicts({
        lectures: this.getConflictCandidates(),
        teacherId: lecture.teacherId,
        roomId: lecture.roomId,
        divisionId: lecture.divisionId,
        dayOfWeek: targetDay,
        periodNumber: targetPeriod,
        excludeLectureId: lecture.id,
      });

      if (conflictCheck.hasConflict) {
        const primary = conflictCheck.conflicts[0];
        throw new TimetableError(409, primary.type, primary.message, {
          conflicts: conflictCheck.conflicts,
          targetDay: targetDayName,
          targetPeriod,
          timeSlot: slotInfo.timeString,
        });
      }

      const oldValues = {
        dayOfWeek: lecture.dayOfWeek,
        dayName: lecture.dayName,
        periodNumber: lecture.periodNumber,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        status: lecture.status,
      };

      const newValues = {
        dayOfWeek: targetDay,
        dayName: targetDayName,
        periodNumber: targetPeriod,
        startTime: params.startTime || slotInfo.startTime,
        endTime: params.endTime || slotInfo.endTime,
        status: 'RESCHEDULED',
      };

      lecture.dayOfWeek = targetDay;
      lecture.dayName = targetDayName;
      lecture.periodNumber = targetPeriod;
      lecture.startTime = params.startTime || slotInfo.startTime;
      lecture.endTime = params.endTime || slotInfo.endTime;
      lecture.status = 'RESCHEDULED';
      lecture.updatedAt = new Date().toISOString();

      const changeRecord: TimetableChangeRecord = {
        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lectureId: lecture.id,
        changedByUserId: user.id,
        changedByRole: user.role,
        changeType: 'RESCHEDULE',
        oldValues,
        newValues,
        reason: params.reason.trim(),
        createdAt: new Date().toISOString(),
      };

      inMemoryChanges.push(changeRecord);

      await eventPublisher.publishEvent({
        eventType: 'timetable:lecture_rescheduled',
        lectureId: lecture.id,
        divisionId: lecture.divisionId,
        divisionKey: lecture.divisionKey,
        course: lecture.course,
        year: lecture.year,
        division: lecture.division,
        subjectName: lecture.subjectName,
        teacherId: lecture.teacherId,
        teacherName: lecture.teacherName,
        roomId: lecture.roomId,
        roomName: lecture.roomName,
        dayName: targetDayName,
        timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
        oldValue: `${oldValues.dayName} • ${oldValues.startTime} - ${oldValues.endTime}`,
        newValue: `${targetDayName} • ${lecture.startTime} - ${lecture.endTime}`,
        reason: params.reason.trim(),
        changedByRole: user.role,
        changedByUserId: user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Lecture rescheduled successfully.',
        lecture,
        changeRecord,
      };
    } finally {
      release();
    }
  }

  /**
   * CHANGE ROOM
   * Verifies target room availability and updates within transaction
   */
  async changeRoom(lectureId: string, user: AuthenticatedUser, params: ChangeRoomParams): Promise<any> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students cannot change lecture classrooms.');
    }

    const targetRoomStr = params.roomId.trim();

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const lecture = await tx.lecture.findUnique({
          where: { id: lectureId },
          include: {
            teacher: true,
            room: true,
            division: { include: { course: { include: { department: true } } } },
            subject: true,
          },
        });

        if (!lecture) {
          throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
        }

        if (user.role === 'TEACHER') {
          const teacherId = user.teacher?.teacherId || user.identifier;
          if (lecture.teacher.teacherId.toLowerCase() !== teacherId.toLowerCase() && lecture.teacher.userId !== user.id) {
            throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot modify room assignment for another teacher\'s lecture.');
          }
        }

        const roomRecord = await tx.room.findFirst({
          where: {
            OR: [
              { roomCode: targetRoomStr },
              { roomName: targetRoomStr },
              { id: targetRoomStr },
            ],
          },
        });

        if (!roomRecord) {
          throw new TimetableError(404, 'NOT_FOUND', `Classroom ${targetRoomStr} does not exist in master records.`);
        }

        // Conflict check against active lectures
        const activeLectures = await tx.lecture.findMany({
          where: { status: { not: LectureStatus.CANCELLED } },
          include: { teacher: true, room: true, division: true, subject: true },
        });

        const candidates: LectureConflictCandidate[] = activeLectures.map(l => ({
          id: l.id,
          teacherId: l.teacher.teacherId,
          teacherName: l.teacher.fullName,
          roomId: l.room.roomCode,
          roomName: l.room.roomName,
          divisionId: l.division.fullName,
          divisionName: l.division.fullName,
          dayOfWeek: l.dayOfWeek,
          periodNumber: l.periodNumber,
          subjectName: l.subject.name,
          status: l.status,
        }));

        const roomConflict = conflictService.checkRoomConflict(
          candidates,
          roomRecord.roomCode,
          lecture.dayOfWeek,
          lecture.periodNumber,
          lecture.id
        );

        if (roomConflict) {
          throw new TimetableError(409, 'ROOM_CONFLICT', roomConflict.message, roomConflict.details);
        }

        const oldValues = {
          roomId: lecture.room.roomCode,
          roomName: lecture.room.roomName,
          status: lecture.status,
        };

        const newValues = {
          roomId: roomRecord.roomCode,
          roomName: roomRecord.roomName,
          status: 'ROOM_CHANGED',
        };

        const updated = await tx.lecture.update({
          where: { id: lectureId },
          data: {
            roomId: roomRecord.id,
            status: LectureStatus.ROOM_CHANGED,
          },
          include: {
            subject: true,
            teacher: true,
            division: { include: { course: { include: { department: true } } } },
            room: true,
          },
        });

        const userRec = await tx.user.findFirst({
          where: { OR: [{ id: user.id }, { identifier: user.identifier }] },
        });

        const changeRecord = await tx.timetableChange.create({
          data: {
            lectureId: lecture.id,
            changedByUserId: userRec?.id || null,
            changeType: 'ROOM_CHANGE',
            oldValues,
            newValues,
            reason: (params.reason || 'Room change request').trim(),
          },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_room_changed',
          lectureId: lecture.id,
          divisionId: lecture.division.fullName,
          divisionKey: lecture.division.fullName,
          course: lecture.division.course.name,
          year: lecture.division.academicYear,
          division: lecture.division.divisionName,
          subjectName: lecture.subject.name,
          teacherId: lecture.teacher.teacherId,
          teacherName: lecture.teacher.fullName,
          roomId: roomRecord.roomCode,
          roomName: roomRecord.roomName,
          dayName: lecture.dayName,
          timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
          oldValue: oldValues.roomName,
          newValue: roomRecord.roomName,
          reason: (params.reason || 'Room change request').trim(),
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Lecture classroom changed successfully.',
          lecture: formatDbLecture(updated),
          changeRecord: {
            id: changeRecord.id,
            lectureId: changeRecord.lectureId,
            changedByUserId: changeRecord.changedByUserId,
            changedByRole: user.role,
            changeType: changeRecord.changeType,
            oldValues: changeRecord.oldValues,
            newValues: changeRecord.newValues,
            reason: changeRecord.reason,
            createdAt: changeRecord.createdAt.toISOString(),
          },
        };
      });

      // Synchronize in-memory mirror
      initializeFallbackStore();
      const inMem = inMemoryLectures.find(l => l.id === lectureId);
      if (inMem) {
        inMem.roomId = targetRoomStr;
        inMem.roomName = targetRoomStr;
        inMem.status = 'ROOM_CHANGED';
        inMemoryChanges.push(finalResult.changeRecord);
      }

      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const release = await timetableMutex.acquire();
    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];
      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot modify room assignment for another teacher\'s lecture.');
        }
      }

      const roomExists = INITIAL_CLASSROOMS.some(
        r => r.name.toLowerCase() === targetRoomStr.toLowerCase() || (r.code && r.code.toLowerCase() === targetRoomStr.toLowerCase())
      );
      if (!roomExists) {
        throw new TimetableError(404, 'NOT_FOUND', `Classroom ${targetRoomStr} does not exist in master records.`);
      }

      const roomConflict = conflictService.checkRoomConflict(
        this.getConflictCandidates(),
        targetRoomStr,
        lecture.dayOfWeek,
        lecture.periodNumber,
        lecture.id
      );

      if (roomConflict) {
        throw new TimetableError(409, 'ROOM_CONFLICT', roomConflict.message, roomConflict.details);
      }

      const oldValues = { roomId: lecture.roomId, roomName: lecture.roomName, status: lecture.status };
      const newValues = { roomId: targetRoomStr, roomName: targetRoomStr, status: 'ROOM_CHANGED' };

      lecture.roomId = targetRoomStr;
      lecture.roomName = targetRoomStr;
      lecture.status = 'ROOM_CHANGED';
      lecture.updatedAt = new Date().toISOString();

      const changeRecord: TimetableChangeRecord = {
        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lectureId: lecture.id,
        changedByUserId: user.id,
        changedByRole: user.role,
        changeType: 'ROOM_CHANGE',
        oldValues,
        newValues,
        reason: (params.reason || 'Room change request').trim(),
        createdAt: new Date().toISOString(),
      };

      inMemoryChanges.push(changeRecord);

      await eventPublisher.publishEvent({
        eventType: 'timetable:lecture_room_changed',
        lectureId: lecture.id,
        divisionId: lecture.divisionId,
        divisionKey: lecture.divisionKey,
        course: lecture.course,
        year: lecture.year,
        division: lecture.division,
        subjectName: lecture.subjectName,
        teacherId: lecture.teacherId,
        teacherName: lecture.teacherName,
        roomId: targetRoomStr,
        roomName: targetRoomStr,
        dayName: lecture.dayName,
        timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
        oldValue: oldValues.roomName,
        newValue: targetRoomStr,
        reason: (params.reason || 'Room change request').trim(),
        changedByRole: user.role,
        changedByUserId: user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Lecture classroom changed successfully.',
        lecture,
        changeRecord,
      };
    } finally {
      release();
    }
  }

  /**
   * CHANGE TEACHER / ASSIGN SUBSTITUTE
   */
  async changeTeacher(lectureId: string, user: AuthenticatedUser, params: ChangeTeacherParams): Promise<any> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students cannot assign substitute teachers.');
    }

    const substituteId = params.teacherId.trim();

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const lecture = await tx.lecture.findUnique({
          where: { id: lectureId },
          include: {
            teacher: true,
            room: true,
            division: { include: { course: { include: { department: true } } } },
            subject: true,
          },
        });

        if (!lecture) {
          throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
        }

        if (user.role === 'TEACHER') {
          const teacherId = user.teacher?.teacherId || user.identifier;
          if (lecture.teacher.teacherId.toLowerCase() !== teacherId.toLowerCase() && lecture.teacher.userId !== user.id) {
            throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot substitute a lecture assigned to another teacher.');
          }
        }

        const targetTeacher = await tx.teacher.findFirst({
          where: {
            OR: [
              { teacherId: substituteId },
              { fullName: substituteId },
              { id: substituteId },
            ],
          },
        });

        if (!targetTeacher) {
          throw new TimetableError(404, 'NOT_FOUND', `Faculty member ${substituteId} not found.`);
        }

        // Conflict check
        const activeLectures = await tx.lecture.findMany({
          where: { status: { not: LectureStatus.CANCELLED } },
          include: { teacher: true, room: true, division: true, subject: true },
        });

        const candidates: LectureConflictCandidate[] = activeLectures.map(l => ({
          id: l.id,
          teacherId: l.teacher.teacherId,
          teacherName: l.teacher.fullName,
          roomId: l.room.roomCode,
          roomName: l.room.roomName,
          divisionId: l.division.fullName,
          divisionName: l.division.fullName,
          dayOfWeek: l.dayOfWeek,
          periodNumber: l.periodNumber,
          subjectName: l.subject.name,
          status: l.status,
        }));

        const teacherConflict = conflictService.checkTeacherConflict(
          candidates,
          targetTeacher.teacherId,
          lecture.dayOfWeek,
          lecture.periodNumber,
          lecture.id
        );

        if (teacherConflict) {
          throw new TimetableError(
            409,
            'TEACHER_CONFLICT',
            `Substitute faculty ${targetTeacher.fullName} already has another lecture during this period.`,
            teacherConflict.details
          );
        }

        const oldValues = {
          teacherId: lecture.teacher.teacherId,
          teacherName: lecture.teacher.fullName,
          status: lecture.status,
        };

        const newValues = {
          teacherId: targetTeacher.teacherId,
          teacherName: targetTeacher.fullName,
          status: 'SUBSTITUTE',
        };

        const updated = await tx.lecture.update({
          where: { id: lectureId },
          data: {
            teacherId: targetTeacher.id,
            status: LectureStatus.SUBSTITUTE,
          },
          include: {
            subject: true,
            teacher: true,
            division: { include: { course: { include: { department: true } } } },
            room: true,
          },
        });

        const userRec = await tx.user.findFirst({
          where: { OR: [{ id: user.id }, { identifier: user.identifier }] },
        });

        const changeRecord = await tx.timetableChange.create({
          data: {
            lectureId: lecture.id,
            changedByUserId: userRec?.id || null,
            changeType: 'TEACHER_CHANGE',
            oldValues,
            newValues,
            reason: (params.reason || 'Faculty substitute assignment').trim(),
          },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_teacher_changed',
          lectureId: lecture.id,
          divisionId: lecture.division.fullName,
          divisionKey: lecture.division.fullName,
          course: lecture.division.course.name,
          year: lecture.division.academicYear,
          division: lecture.division.divisionName,
          subjectName: lecture.subject.name,
          teacherId: oldValues.teacherId,
          teacherName: oldValues.teacherName,
          substituteTeacherId: targetTeacher.teacherId,
          substituteTeacherName: targetTeacher.fullName,
          roomId: lecture.room.roomCode,
          roomName: lecture.room.roomName,
          dayName: lecture.dayName,
          timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
          oldValue: oldValues.teacherName,
          newValue: targetTeacher.fullName,
          reason: (params.reason || 'Faculty substitute assignment').trim(),
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Substitute faculty assigned successfully.',
          lecture: formatDbLecture(updated),
          changeRecord: {
            id: changeRecord.id,
            lectureId: changeRecord.lectureId,
            changedByUserId: changeRecord.changedByUserId,
            changedByRole: user.role,
            changeType: changeRecord.changeType,
            oldValues: changeRecord.oldValues,
            newValues: changeRecord.newValues,
            reason: changeRecord.reason,
            createdAt: changeRecord.createdAt.toISOString(),
          },
        };
      });

      // Mirror in-memory
      initializeFallbackStore();
      const inMem = inMemoryLectures.find(l => l.id === lectureId);
      if (inMem) {
        inMem.teacherId = substituteId;
        inMem.teacherName = substituteId;
        inMem.status = 'SUBSTITUTE';
        inMemoryChanges.push(finalResult.changeRecord);
      }

      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const release = await timetableMutex.acquire();
    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];
      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(403, 'FORBIDDEN', 'Faculty cannot substitute a lecture assigned to another teacher.');
        }
      }

      const targetTeacher = TEACHERS_DATA.find(
        t => t.id.toLowerCase() === substituteId.toLowerCase() || t.name.toLowerCase() === substituteId.toLowerCase()
      );
      if (!targetTeacher) {
        throw new TimetableError(404, 'NOT_FOUND', `Faculty member ${substituteId} not found.`);
      }

      const teacherConflict = conflictService.checkTeacherConflict(
        this.getConflictCandidates(),
        targetTeacher.id,
        lecture.dayOfWeek,
        lecture.periodNumber,
        lecture.id
      );

      if (teacherConflict) {
        throw new TimetableError(
          409,
          'TEACHER_CONFLICT',
          `Substitute faculty ${targetTeacher.name} already has another lecture during this period.`,
          teacherConflict.details
        );
      }

      const oldValues = { teacherId: lecture.teacherId, teacherName: lecture.teacherName, status: lecture.status };
      const newValues = { teacherId: targetTeacher.id, teacherName: targetTeacher.name, status: 'SUBSTITUTE' };

      lecture.teacherId = targetTeacher.id;
      lecture.teacherName = targetTeacher.name;
      lecture.status = 'SUBSTITUTE';
      lecture.updatedAt = new Date().toISOString();

      const changeRecord: TimetableChangeRecord = {
        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lectureId: lecture.id,
        changedByUserId: user.id,
        changedByRole: user.role,
        changeType: 'TEACHER_CHANGE',
        oldValues,
        newValues,
        reason: (params.reason || 'Faculty substitute assignment').trim(),
        createdAt: new Date().toISOString(),
      };

      inMemoryChanges.push(changeRecord);

      await eventPublisher.publishEvent({
        eventType: 'timetable:lecture_teacher_changed',
        lectureId: lecture.id,
        divisionId: lecture.divisionId,
        divisionKey: lecture.divisionKey,
        course: lecture.course,
        year: lecture.year,
        division: lecture.division,
        subjectName: lecture.subjectName,
        teacherId: oldValues.teacherId,
        teacherName: oldValues.teacherName,
        substituteTeacherId: targetTeacher.id,
        substituteTeacherName: targetTeacher.name,
        roomId: lecture.roomId,
        roomName: lecture.roomName,
        dayName: lecture.dayName,
        timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
        oldValue: oldValues.teacherName,
        newValue: targetTeacher.name,
        reason: (params.reason || 'Faculty substitute assignment').trim(),
        changedByRole: user.role,
        changedByUserId: user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Substitute faculty assigned successfully.',
        lecture,
        changeRecord,
      };
    } finally {
      release();
    }
  }

  /**
   * CREATE EXTRA LECTURE
   */
  async createExtraLecture(user: AuthenticatedUser, params: ExtraLectureParams): Promise<any> {
    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students cannot schedule extra lectures.');
    }

    const targetDay = Number(params.dayOfWeek);
    const targetPeriod = Number(params.periodNumber);
    const slotInfo = PERIOD_TIME_MAP[targetPeriod];
    const targetDayName = DAY_NUMBER_MAP[targetDay];

    if (!slotInfo || !targetDayName) {
      throw new TimetableError(400, 'BAD_REQUEST', 'Invalid day of week or period number.');
    }

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const division = await tx.division.findFirst({
          where: {
            OR: [
              { fullName: params.divisionId },
              { fullName: params.divisionId.replace(/_/g, '-') },
              { id: params.divisionId },
            ],
          },
          include: { course: { include: { department: true } } },
        });

        if (!division) {
          throw new TimetableError(404, 'NOT_FOUND', `Division ${params.divisionId} not found.`);
        }

        const teacher = await tx.teacher.findFirst({
          where: {
            OR: [{ teacherId: params.teacherId }, { id: params.teacherId }],
          },
        });

        if (!teacher) {
          throw new TimetableError(404, 'NOT_FOUND', `Teacher ${params.teacherId} not found.`);
        }

        const room = await tx.room.findFirst({
          where: {
            OR: [{ roomCode: params.roomId }, { roomName: params.roomId }, { id: params.roomId }],
          },
        });

        if (!room) {
          throw new TimetableError(404, 'NOT_FOUND', `Room ${params.roomId} not found.`);
        }

        const subject = await tx.subject.findFirst({
          where: {
            OR: [
              { code: params.subjectId },
              { name: params.subjectId },
              { id: params.subjectId },
            ],
          },
        }) || await tx.subject.findFirst({ where: { courseId: division.courseId } });

        if (!subject) {
          throw new TimetableError(404, 'NOT_FOUND', `Subject ${params.subjectId} not found.`);
        }

        // Conflict check
        const activeLectures = await tx.lecture.findMany({
          where: { status: { not: LectureStatus.CANCELLED } },
          include: { teacher: true, room: true, division: true, subject: true },
        });

        const candidates: LectureConflictCandidate[] = activeLectures.map(l => ({
          id: l.id,
          teacherId: l.teacher.teacherId,
          teacherName: l.teacher.fullName,
          roomId: l.room.roomCode,
          roomName: l.room.roomName,
          divisionId: l.division.fullName,
          divisionName: l.division.fullName,
          dayOfWeek: l.dayOfWeek,
          periodNumber: l.periodNumber,
          subjectName: l.subject.name,
          status: l.status,
        }));

        const conflictCheck = conflictService.checkAllConflicts({
          lectures: candidates,
          teacherId: teacher.teacherId,
          roomId: room.roomCode,
          divisionId: division.fullName,
          dayOfWeek: targetDay,
          periodNumber: targetPeriod,
        });

        if (conflictCheck.hasConflict) {
          const primary = conflictCheck.conflicts[0];
          throw new TimetableError(409, primary.type, primary.message, {
            conflicts: conflictCheck.conflicts,
          });
        }

        const newLecId = `lec-extra-${Date.now()}`;
        const created = await tx.lecture.create({
          data: {
            id: newLecId,
            divisionId: division.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            roomId: room.id,
            dayOfWeek: targetDay,
            dayName: targetDayName,
            periodNumber: targetPeriod,
            startTime: params.startTime || slotInfo.startTime,
            endTime: params.endTime || slotInfo.endTime,
            status: LectureStatus.SCHEDULED,
          },
          include: {
            subject: true,
            teacher: true,
            division: { include: { course: { include: { department: true } } } },
            room: true,
          },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_created',
          lectureId: created.id,
          divisionId: division.fullName,
          divisionKey: division.fullName,
          course: division.course.name,
          year: division.academicYear,
          division: division.divisionName,
          subjectName: subject.name,
          teacherId: teacher.teacherId,
          teacherName: teacher.fullName,
          roomId: room.roomCode,
          roomName: room.roomName,
          dayName: targetDayName,
          timeSlot: `${created.startTime} - ${created.endTime}`,
          newValue: `${targetDayName} • ${created.startTime} - ${created.endTime} (${room.roomName})`,
          reason: params.reason || 'Extra lecture',
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Extra lecture scheduled successfully.',
          lecture: formatDbLecture(created),
        };
      });

      // Mirror in-memory
      initializeFallbackStore();
      inMemoryLectures.push(finalResult.lecture);

      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const release = await timetableMutex.acquire();
    try {
      const conflictCheck = conflictService.checkAllConflicts({
        lectures: this.getConflictCandidates(),
        teacherId: params.teacherId,
        roomId: params.roomId,
        divisionId: params.divisionId,
        dayOfWeek: targetDay,
        periodNumber: targetPeriod,
      });

      if (conflictCheck.hasConflict) {
        const primary = conflictCheck.conflicts[0];
        throw new TimetableError(409, primary.type, primary.message, {
          conflicts: conflictCheck.conflicts,
        });
      }

      const newLecture = {
        id: `lec-extra-${Date.now()}`,
        divisionId: params.divisionId,
        divisionKey: params.divisionId,
        course: params.divisionId.split('_')[0] || 'GENERAL',
        year: params.divisionId.split('_')[1] || 'FY',
        division: params.divisionId.split('_')[2] || 'A',
        department: 'Academic Division',
        subjectId: params.subjectId,
        subjectName: params.subjectId,
        teacherId: params.teacherId,
        teacherName: params.teacherId,
        roomId: params.roomId,
        roomName: params.roomId,
        dayOfWeek: targetDay,
        dayName: targetDayName,
        periodNumber: targetPeriod,
        startTime: params.startTime || slotInfo.startTime,
        endTime: params.endTime || slotInfo.endTime,
        status: 'SCHEDULED',
        originalTeacherId: params.teacherId,
        originalRoomId: params.roomId,
        originalDay: targetDayName,
        originalStartTime: params.startTime || slotInfo.startTime,
        originalEndTime: params.endTime || slotInfo.endTime,
        cancellationReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryLectures.push(newLecture);

      await eventPublisher.publishEvent({
        eventType: 'timetable:lecture_created',
        lectureId: newLecture.id,
        divisionId: newLecture.divisionId,
        divisionKey: newLecture.divisionKey,
        course: newLecture.course,
        year: newLecture.year,
        division: newLecture.division,
        subjectName: newLecture.subjectName,
        teacherId: newLecture.teacherId,
        teacherName: newLecture.teacherName,
        roomId: newLecture.roomId,
        roomName: newLecture.roomName,
        dayName: newLecture.dayName,
        timeSlot: `${newLecture.startTime} - ${newLecture.endTime}`,
        newValue: `${newLecture.dayName} • ${newLecture.startTime} - ${newLecture.endTime} (${newLecture.roomName})`,
        reason: params.reason || 'Extra lecture',
        changedByRole: user.role,
        changedByUserId: user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Extra lecture scheduled successfully.',
        lecture: newLecture,
      };
    } finally {
      release();
    }
  }

  /**
   * DELETE LECTURE (ADMIN ONLY)
   */
  async deleteLecture(lectureId: string, user: AuthenticatedUser): Promise<any> {
    if (user.role !== 'ADMIN') {
      throw new TimetableError(403, 'FORBIDDEN', 'Only administrators can delete timetable records.');
    }

    if (isDbConfigured) {
      let realtimePayload: any = null;
      let finalResult: any = null;

      await prisma.$transaction(async tx => {
        const lecture = await tx.lecture.findUnique({
          where: { id: lectureId },
          include: {
            teacher: true,
            room: true,
            division: { include: { course: { include: { department: true } } } },
            subject: true,
          },
        });

        if (!lecture) {
          throw new TimetableError(404, 'NOT_FOUND', `Lecture ${lectureId} not found.`);
        }

        await tx.lecture.delete({
          where: { id: lectureId },
        });

        realtimePayload = {
          eventType: 'timetable:lecture_deleted',
          lectureId: lecture.id,
          divisionId: lecture.division.fullName,
          divisionKey: lecture.division.fullName,
          course: lecture.division.course.name,
          year: lecture.division.academicYear,
          division: lecture.division.divisionName,
          subjectName: lecture.subject.name,
          teacherId: lecture.teacher.teacherId,
          teacherName: lecture.teacher.fullName,
          roomId: lecture.room.roomCode,
          roomName: lecture.room.roomName,
          dayName: lecture.dayName,
          timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
          oldValue: `${lecture.dayName} • ${lecture.startTime} - ${lecture.endTime}`,
          reason: 'Administrative removal',
          changedByRole: user.role,
          changedByUserId: user.id,
          timestamp: new Date().toISOString(),
        };

        finalResult = {
          message: 'Lecture deleted successfully.',
          lecture: formatDbLecture(lecture),
        };
      });

      // Mirror in-memory
      initializeFallbackStore();
      const idx = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (idx !== -1) {
        inMemoryLectures.splice(idx, 1);
      }

      if (realtimePayload) {
        await eventPublisher.publishEvent(realtimePayload);
      }

      return finalResult;
    }

    // Fallback mode
    initializeFallbackStore();
    const index = inMemoryLectures.findIndex(l => l.id === lectureId);
    if (index === -1) {
      throw new TimetableError(404, 'NOT_FOUND', `Lecture ${lectureId} not found.`);
    }

    const removed = inMemoryLectures.splice(index, 1)[0];

    await eventPublisher.publishEvent({
      eventType: 'timetable:lecture_deleted',
      lectureId: removed.id,
      divisionId: removed.divisionId,
      divisionKey: removed.divisionKey,
      course: removed.course,
      year: removed.year,
      division: removed.division,
      subjectName: removed.subjectName,
      teacherId: removed.teacherId,
      teacherName: removed.teacherName,
      roomId: removed.roomId,
      roomName: removed.roomName,
      dayName: removed.dayName,
      timeSlot: `${removed.startTime} - ${removed.endTime}`,
      oldValue: `${removed.dayName} • ${removed.startTime} - ${removed.endTime}`,
      reason: 'Administrative removal',
      changedByRole: user.role,
      changedByUserId: user.id,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Lecture deleted successfully.',
      lecture: removed,
    };
  }

  /**
   * AUDIT REPORT / INTEGRITY VERIFICATION
   */
  getIntegrityReport(): {
    totalLectures: number;
    teacherConflicts: number;
    roomConflicts: number;
    divisionConflicts: number;
    totalChangesRecorded: number;
  } {
    initializeFallbackStore();

    let teacherConflicts = 0;
    let roomConflicts = 0;
    let divisionConflicts = 0;

    const teacherMap = new Map<string, string>();
    const roomMap = new Map<string, string>();
    const divisionMap = new Map<string, string>();

    for (const l of inMemoryLectures) {
      if (l.status === 'CANCELLED') continue;

      const tKey = `${l.teacherId}_${l.dayOfWeek}_${l.periodNumber}`;
      const rKey = `${l.roomId}_${l.dayOfWeek}_${l.periodNumber}`;
      const dKey = `${l.divisionKey}_${l.dayOfWeek}_${l.periodNumber}`;

      if (teacherMap.has(tKey)) teacherConflicts++;
      else teacherMap.set(tKey, l.id);

      if (roomMap.has(rKey)) roomConflicts++;
      else roomMap.set(rKey, l.id);

      if (divisionMap.has(dKey)) divisionConflicts++;
      else divisionMap.set(dKey, l.id);
    }

    return {
      totalLectures: inMemoryLectures.length,
      teacherConflicts,
      roomConflicts,
      divisionConflicts,
      totalChangesRecorded: inMemoryChanges.length,
    };
  }

  /**
   * Async Database Integrity Report querying real PostgreSQL
   */
  async getDbIntegrityReport(): Promise<{
    totalLectures: number;
    teacherConflicts: number;
    roomConflicts: number;
    divisionConflicts: number;
    totalChangesRecorded: number;
  }> {
    if (!isDbConfigured) {
      return this.getIntegrityReport();
    }

    const lectures = await prisma.lecture.findMany({
      include: {
        teacher: true,
        room: true,
        division: true,
      },
    });

    const totalChangesRecorded = await prisma.timetableChange.count();

    let teacherConflicts = 0;
    let roomConflicts = 0;
    let divisionConflicts = 0;

    const teacherMap = new Map<string, string>();
    const roomMap = new Map<string, string>();
    const divisionMap = new Map<string, string>();

    for (const l of lectures) {
      if (l.status === LectureStatus.CANCELLED) continue;

      const tKey = `${l.teacher.teacherId}_${l.dayOfWeek}_${l.periodNumber}`;
      const rKey = `${l.room.roomCode}_${l.dayOfWeek}_${l.periodNumber}`;
      const dKey = `${l.division.fullName}_${l.dayOfWeek}_${l.periodNumber}`;

      if (teacherMap.has(tKey)) teacherConflicts++;
      else teacherMap.set(tKey, l.id);

      if (roomMap.has(rKey)) roomConflicts++;
      else roomMap.set(rKey, l.id);

      if (divisionMap.has(dKey)) divisionConflicts++;
      else divisionMap.set(dKey, l.id);
    }

    return {
      totalLectures: lectures.length,
      teacherConflicts,
      roomConflicts,
      divisionConflicts,
      totalChangesRecorded,
    };
  }
}

export const timetableService = new TimetableService();
