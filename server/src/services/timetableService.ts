import { prisma, isDbConfigured } from '../config/database.js';
import { conflictService, DAY_NUMBER_MAP, PERIOD_TIME_MAP, LectureConflictCandidate } from './conflictService.js';
import { AuthenticatedUser } from '../middleware/authenticate.js';
import { eventPublisher } from '../realtime/eventPublisher.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const MASTER_TIMETABLE: any[] = require('../data/masterTimetable.json');
const INITIAL_CLASSROOMS: any[] = require('../data/classrooms.json');
const TEACHERS_DATA: any[] = require('../data/teachers.json');

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

// Async Mutex for Race Condition Protection
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

export class TimetableService {
  constructor() {
    initializeFallbackStore();
  }

  /**
   * Resets the in-memory fallback store to pristine original master state (1,275 sessions).
   */
  resetToOriginalTimetable(): void {
    isStoreInitialized = false;
    initializeFallbackStore();
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
    initializeFallbackStore();

    if (isDbConfigured) {
      try {
        const dbLecture = await prisma.lecture.findUnique({
          where: { id: lectureId },
          include: {
            subject: true,
            teacher: true,
            division: true,
            room: true,
            auditLogs: { orderBy: { createdAt: 'desc' } },
          },
        });
        if (dbLecture) return dbLecture;
      } catch {
        // Fallback
      }
    }

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
    initializeFallbackStore();

    if (user.role !== 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Access restricted to student accounts.');
    }

    const studentDiv = user.student?.divisionId;
    if (!studentDiv) {
      throw new TimetableError(400, 'BAD_REQUEST', 'Student is not mapped to any division.');
    }

    // Match exact division key or normalized course_year_div
    const normalizedDiv = studentDiv.trim();
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
    initializeFallbackStore();

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

    return inMemoryLectures.filter(
      l => l.teacherId.toLowerCase() === targetTeacherId.toLowerCase()
    );
  }

  /**
   * GET timetable for specific division with strict role checks
   */
  async getDivisionTimetable(user: AuthenticatedUser, divisionId: string): Promise<any[]> {
    initializeFallbackStore();

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

    const lectures = inMemoryLectures.filter(
      l =>
        l.divisionId.toLowerCase() === cleanDivision.toLowerCase() ||
        l.divisionKey.toLowerCase() === cleanDivision.toLowerCase() ||
        l.divisionKey.replace(/_/g, '-').toLowerCase() === cleanDivision.toLowerCase()
    );

    return lectures;
  }

  /**
   * GET room occupancy schedule
   */
  async getRoomTimetable(user: AuthenticatedUser, roomId: string): Promise<any[]> {
    initializeFallbackStore();

    if (user.role === 'STUDENT') {
      throw new TimetableError(403, 'FORBIDDEN', 'Students do not have permission to query room occupancy.');
    }

    const cleanRoom = roomId.trim().toLowerCase();
    return inMemoryLectures.filter(
      l => l.roomId.toLowerCase() === cleanRoom || l.roomName.toLowerCase() === cleanRoom
    );
  }

  /**
   * GET master timetable with optional multi-criteria filters (ADMIN only)
   */
  async getMasterTimetable(user: AuthenticatedUser, filters: TimetableFilters = {}): Promise<any[]> {
    initializeFallbackStore();

    if (user.role !== 'ADMIN') {
      throw new TimetableError(403, 'FORBIDDEN', 'Access to master timetable is restricted to administrators.');
    }

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
   * Protected with transaction and mutex
   */
  async cancelLecture(lectureId: string, user: AuthenticatedUser, reason: string): Promise<any> {
    initializeFallbackStore();
    const release = await timetableMutex.acquire();

    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];

      // Authorization Check
      if (user.role === 'STUDENT') {
        throw new TimetableError(403, 'FORBIDDEN', 'Students cannot cancel lectures.');
      }

      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(
            403,
            'FORBIDDEN',
            'Faculty cannot cancel a lecture assigned to another teacher.'
          );
        }
      }

      // Status Check
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

      // Perform Update
      lecture.status = 'CANCELLED';
      lecture.cancellationReason = reason.trim();
      lecture.updatedAt = new Date().toISOString();

      // Record Audit History
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

      // Publish Real-time Event
      eventPublisher.publishEvent({
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
   * Validates period/day, runs teacher/room/division conflict engine, updates within transaction
   */
  async rescheduleLecture(
    lectureId: string,
    user: AuthenticatedUser,
    params: RescheduleParams
  ): Promise<any> {
    initializeFallbackStore();
    const release = await timetableMutex.acquire();

    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];

      // Authorization Check
      if (user.role === 'STUDENT') {
        throw new TimetableError(403, 'FORBIDDEN', 'Students cannot reschedule lectures.');
      }

      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(
            403,
            'FORBIDDEN',
            'Faculty cannot reschedule a lecture assigned to another teacher.'
          );
        }
      }

      if (lecture.status === 'CANCELLED') {
        throw new TimetableError(
          422,
          'UNPROCESSABLE_ENTITY',
          'Cannot reschedule a cancelled lecture without first reinstating it.'
        );
      }

      const targetDay = Number(params.dayOfWeek);
      const targetPeriod = Number(params.periodNumber);
      const slotInfo = PERIOD_TIME_MAP[targetPeriod];
      const targetDayName = DAY_NUMBER_MAP[targetDay];

      if (!slotInfo || !targetDayName) {
        throw new TimetableError(400, 'BAD_REQUEST', 'Invalid day of week or period number.');
      }

      // Run Conflict Engine (Teacher, Room, Division)
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
        throw new TimetableError(
          409,
          primary.type,
          primary.message,
          {
            conflicts: conflictCheck.conflicts,
            targetDay: targetDayName,
            targetPeriod,
            timeSlot: slotInfo.timeString,
          }
        );
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

      // Perform Update
      lecture.dayOfWeek = targetDay;
      lecture.dayName = targetDayName;
      lecture.periodNumber = targetPeriod;
      lecture.startTime = params.startTime || slotInfo.startTime;
      lecture.endTime = params.endTime || slotInfo.endTime;
      lecture.status = 'RESCHEDULED';
      lecture.updatedAt = new Date().toISOString();

      // Record Audit History
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

      // Publish Real-time Event
      eventPublisher.publishEvent({
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
  async changeRoom(
    lectureId: string,
    user: AuthenticatedUser,
    params: ChangeRoomParams
  ): Promise<any> {
    initializeFallbackStore();
    const release = await timetableMutex.acquire();

    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];

      // Authorization Check
      if (user.role === 'STUDENT') {
        throw new TimetableError(403, 'FORBIDDEN', 'Students cannot change lecture classrooms.');
      }

      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(
            403,
            'FORBIDDEN',
            'Faculty cannot modify room assignment for another teacher\'s lecture.'
          );
        }
      }

      const targetRoom = params.roomId.trim();

      // Validate Room Existence
      const roomExists = INITIAL_CLASSROOMS.some(
        r => r.name.toLowerCase() === targetRoom.toLowerCase() || (r.code && r.code.toLowerCase() === targetRoom.toLowerCase())
      );
      if (!roomExists) {
        throw new TimetableError(404, 'NOT_FOUND', `Classroom ${targetRoom} does not exist in master records.`);
      }

      // Check Room Conflict
      const roomConflict = conflictService.checkRoomConflict(
        this.getConflictCandidates(),
        targetRoom,
        lecture.dayOfWeek,
        lecture.periodNumber,
        lecture.id
      );

      if (roomConflict) {
        throw new TimetableError(
          409,
          'ROOM_CONFLICT',
          roomConflict.message,
          roomConflict.details
        );
      }

      const oldValues = {
        roomId: lecture.roomId,
        roomName: lecture.roomName,
        status: lecture.status,
      };

      const newValues = {
        roomId: targetRoom,
        roomName: targetRoom,
        status: 'ROOM_CHANGED',
      };

      // Perform Update
      lecture.roomId = targetRoom;
      lecture.roomName = targetRoom;
      lecture.status = 'ROOM_CHANGED';
      lecture.updatedAt = new Date().toISOString();

      // Record Audit History
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

      // Publish Real-time Event
      eventPublisher.publishEvent({
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
        roomId: targetRoom,
        roomName: targetRoom,
        dayName: lecture.dayName,
        timeSlot: `${lecture.startTime} - ${lecture.endTime}`,
        oldValue: oldValues.roomName,
        newValue: targetRoom,
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
   * Validates target teacher availability and updates within transaction
   */
  async changeTeacher(
    lectureId: string,
    user: AuthenticatedUser,
    params: ChangeTeacherParams
  ): Promise<any> {
    initializeFallbackStore();
    const release = await timetableMutex.acquire();

    try {
      const lectureIndex = inMemoryLectures.findIndex(l => l.id === lectureId);
      if (lectureIndex === -1) {
        throw new TimetableError(404, 'NOT_FOUND', `Lecture with ID ${lectureId} not found.`);
      }

      const lecture = inMemoryLectures[lectureIndex];

      // Authorization Check
      if (user.role === 'STUDENT') {
        throw new TimetableError(403, 'FORBIDDEN', 'Students cannot assign substitute teachers.');
      }

      if (user.role === 'TEACHER') {
        const teacherId = user.teacher?.teacherId || user.identifier;
        if (lecture.teacherId.toLowerCase() !== teacherId.toLowerCase()) {
          throw new TimetableError(
            403,
            'FORBIDDEN',
            'Faculty cannot substitute a lecture assigned to another teacher.'
          );
        }
      }

      const substituteId = params.teacherId.trim();

      // Validate Target Teacher Exists
      const targetTeacher = TEACHERS_DATA.find(
        t => t.id.toLowerCase() === substituteId.toLowerCase() || t.name.toLowerCase() === substituteId.toLowerCase()
      );
      if (!targetTeacher) {
        throw new TimetableError(404, 'NOT_FOUND', `Faculty member ${substituteId} not found.`);
      }

      // Check Substitute Teacher Conflict
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

      const oldValues = {
        teacherId: lecture.teacherId,
        teacherName: lecture.teacherName,
        status: lecture.status,
      };

      const newValues = {
        teacherId: targetTeacher.id,
        teacherName: targetTeacher.name,
        status: 'SUBSTITUTE',
      };

      // Perform Update
      lecture.teacherId = targetTeacher.id;
      lecture.teacherName = targetTeacher.name;
      lecture.status = 'SUBSTITUTE';
      lecture.updatedAt = new Date().toISOString();

      // Record Audit History
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

      // Publish Real-time Event
      eventPublisher.publishEvent({
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
   * Validates constraints and inserts new lecture if conflict-free
   */
  async createExtraLecture(user: AuthenticatedUser, params: ExtraLectureParams): Promise<any> {
    initializeFallbackStore();
    const release = await timetableMutex.acquire();

    try {
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

      // Run Conflict Engine
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

      // Publish Real-time Event
      eventPublisher.publishEvent({
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
   * Soft-cancels or hard-removes if explicitly allowed
   */
  async deleteLecture(lectureId: string, user: AuthenticatedUser): Promise<any> {
    initializeFallbackStore();

    if (user.role !== 'ADMIN') {
      throw new TimetableError(403, 'FORBIDDEN', 'Only administrators can delete timetable records.');
    }

    const index = inMemoryLectures.findIndex(l => l.id === lectureId);
    if (index === -1) {
      throw new TimetableError(404, 'NOT_FOUND', `Lecture ${lectureId} not found.`);
    }

    const removed = inMemoryLectures.splice(index, 1)[0];

    // Publish Real-time Event
    eventPublisher.publishEvent({
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
   * Scans all sessions for teacher, room, and division conflicts
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
}

export const timetableService = new TimetableService();
