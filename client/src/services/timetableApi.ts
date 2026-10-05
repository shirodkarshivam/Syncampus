import { fetchWithAuth } from './authApi';
import type { Lecture } from '../data/mockData';

export interface BackendConflictDetails {
  field?: string;
  value?: string | number;
  dayOfWeek?: number;
  periodNumber?: number;
  conflictingLectureId?: string;
  conflictingSubject?: string;
  timeSlot?: string;
  conflicts?: Array<{
    type: string;
    message: string;
    details?: any;
  }>;
}

export class TimetableApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: BackendConflictDetails;

  constructor(statusCode: number, errorCode: string, message: string, details?: BackendConflictDetails) {
    super(message);
    this.name = 'TimetableApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

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

const DAY_NUMBER_MAP: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
};

const TIME_TO_PERIOD: Record<string, number> = {
  '09:00 - 10:00': 1,
  '10:00 - 11:00': 2,
  '11:00 - 12:00': 3,
  '01:00 - 02:00': 4,
  '02:00 - 03:00': 5,
};

/**
 * Normalizes backend lecture entity into frontend React component Lecture contract
 */
export function normalizeBackendLecture(raw: any): Lecture {
  const startTime = raw.startTime || '09:00';
  const endTime = raw.endTime || '10:00';
  const time = raw.time || `${startTime} - ${endTime}`;
  const day = raw.dayName || DAY_NUMBER_MAP[raw.dayOfWeek] || raw.day || 'Monday';

  let semNumber = 1;
  const year = raw.year || 'FY';
  if (year === 'SY') semNumber = 3;
  if (year === 'TY') semNumber = 5;

  let status: 'Scheduled' | 'Rescheduled' | 'Cancelled' = 'Scheduled';
  const rawStatus = (raw.status || '').toUpperCase();
  if (rawStatus === 'CANCELLED') {
    status = 'Cancelled';
  } else if (rawStatus === 'RESCHEDULED' || rawStatus === 'ROOM_CHANGED' || rawStatus === 'SUBSTITUTE') {
    status = 'Rescheduled';
  }

  return {
    id: raw.id,
    time,
    subject: raw.subjectName || raw.subject?.name || raw.subject || 'Subject',
    teacher: raw.teacherName || raw.teacher?.fullName || raw.teacher || 'Faculty',
    room: raw.roomName || raw.room?.roomName || raw.roomId || raw.classroom || 'Room 101',
    department: raw.department || raw.division?.course?.department?.name || 'Science & Technology',
    course: raw.course || raw.division?.course?.name || 'BSc IT',
    semester: semNumber,
    division: raw.division || raw.divisionName || 'A',
    day,
    status,
    originalTime: raw.originalStartTime && raw.originalEndTime ? `${raw.originalStartTime} - ${raw.originalEndTime}` : raw.originalTime,
    originalRoom: raw.originalRoomId || raw.originalRoom,
    originalTeacher: raw.originalTeacherId || raw.originalTeacher,
    year,
    divisionKey: raw.divisionKey || raw.divisionId,
    teacherId: raw.teacherId,
    cancelReason: raw.cancellationReason || raw.cancelReason,
    updatedAt: raw.updatedAt,
  };
}

async function handleApiResponse(res: Response, fallbackMessage: string): Promise<any> {
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // response not JSON
  }

  if (!res.ok) {
    const errorMsg = data.message || data.error || fallbackMessage;
    const errorCode = data.error || (res.status === 409 ? 'CONFLICT' : 'API_ERROR');
    throw new TimetableApiError(res.status, errorCode, errorMsg, data.details);
  }

  return data;
}

export const timetableApi = {
  /**
   * GET /api/v1/students/me/timetable
   * Authoritative student division schedule
   */
  async getStudentTimetable(): Promise<Lecture[]> {
    const res = await fetchWithAuth('/api/v1/students/me/timetable');
    const data = await handleApiResponse(res, 'Failed to fetch student timetable');
    const list = Array.isArray(data.timetable) ? data.timetable : [];
    return list.map(normalizeBackendLecture);
  },

  /**
   * GET /api/v1/teachers/me/timetable
   * Authoritative faculty schedule
   */
  async getTeacherTimetable(teacherId?: string): Promise<Lecture[]> {
    const url = teacherId
      ? `/api/v1/teachers/me/timetable?teacherId=${encodeURIComponent(teacherId)}`
      : '/api/v1/teachers/me/timetable';
    const res = await fetchWithAuth(url);
    const data = await handleApiResponse(res, 'Failed to fetch faculty timetable');
    const list = Array.isArray(data.timetable) ? data.timetable : [];
    return list.map(normalizeBackendLecture);
  },

  /**
   * GET /api/v1/divisions/:divisionId/timetable
   */
  async getDivisionTimetable(divisionId: string): Promise<Lecture[]> {
    const res = await fetchWithAuth(`/api/v1/divisions/${encodeURIComponent(divisionId)}/timetable`);
    const data = await handleApiResponse(res, 'Failed to fetch division timetable');
    const list = Array.isArray(data.timetable) ? data.timetable : [];
    return list.map(normalizeBackendLecture);
  },

  /**
   * GET /api/v1/rooms/:roomId/timetable
   */
  async getRoomTimetable(roomId: string): Promise<Lecture[]> {
    const res = await fetchWithAuth(`/api/v1/rooms/${encodeURIComponent(roomId)}/timetable`);
    const data = await handleApiResponse(res, 'Failed to fetch room occupancy');
    const list = Array.isArray(data.timetable) ? data.timetable : [];
    return list.map(normalizeBackendLecture);
  },

  /**
   * GET /api/v1/admin/timetable
   * Authoritative master college schedule with multi-criteria filters
   */
  async getMasterTimetable(filters: TimetableFilters = {}): Promise<{ total: number; timetable: Lecture[] }> {
    const query = new URLSearchParams();
    if (filters.department) query.set('department', filters.department);
    if (filters.course) query.set('course', filters.course);
    if (filters.academicYear) query.set('academicYear', filters.academicYear);
    if (filters.division) query.set('division', filters.division);
    if (filters.teacher) query.set('teacher', filters.teacher);
    if (filters.room) query.set('room', filters.room);
    if (filters.day) query.set('day', filters.day);
    if (filters.period) query.set('period', String(filters.period));
    if (filters.status) query.set('status', filters.status);

    const queryString = query.toString();
    const url = queryString ? `/api/v1/admin/timetable?${queryString}` : '/api/v1/admin/timetable';

    const res = await fetchWithAuth(url);
    const data = await handleApiResponse(res, 'Failed to fetch master timetable');
    const list = Array.isArray(data.timetable) ? data.timetable : [];
    return {
      total: data.total || list.length,
      timetable: list.map(normalizeBackendLecture),
    };
  },

  /**
   * GET /api/v1/timetable/lectures/:lectureId
   */
  async getLecture(lectureId: string): Promise<Lecture> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}`);
    const data = await handleApiResponse(res, `Failed to fetch lecture ${lectureId}`);
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * GET /api/v1/timetable/lectures/:lectureId/history
   */
  async getLectureHistory(lectureId: string): Promise<any[]> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}/history`);
    const data = await handleApiResponse(res, `Failed to fetch audit history for ${lectureId}`);
    return data.history || [];
  },

  /**
   * POST /api/v1/timetable/lectures/:lectureId/cancel
   */
  async cancelLecture(lectureId: string, reason: string): Promise<Lecture> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason.trim() }),
    });
    const data = await handleApiResponse(res, 'Failed to cancel lecture');
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * POST /api/v1/timetable/lectures/:lectureId/reschedule
   */
  async rescheduleLecture(
    lectureId: string,
    params: {
      dayOfWeek: number | string;
      periodNumber?: number;
      timeString?: string;
      startTime?: string;
      endTime?: string;
      reason: string;
    }
  ): Promise<Lecture> {
    let dayNum = typeof params.dayOfWeek === 'number'
      ? params.dayOfWeek
      : DAY_NAME_TO_NUMBER[String(params.dayOfWeek).toLowerCase()] || 1;

    let periodNum = params.periodNumber;
    if (!periodNum && params.timeString) {
      periodNum = TIME_TO_PERIOD[params.timeString] || 1;
    }

    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({
        dayOfWeek: dayNum,
        periodNumber: periodNum || 1,
        startTime: params.startTime,
        endTime: params.endTime,
        reason: params.reason.trim(),
      }),
    });
    const data = await handleApiResponse(res, 'Failed to reschedule lecture');
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * POST /api/v1/timetable/lectures/:lectureId/change-room
   */
  async changeLectureRoom(lectureId: string, roomId: string, reason?: string): Promise<Lecture> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}/change-room`, {
      method: 'POST',
      body: JSON.stringify({
        roomId: roomId.trim(),
        reason: reason?.trim() || 'Room relocation',
      }),
    });
    const data = await handleApiResponse(res, 'Failed to change lecture room');
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * POST /api/v1/timetable/lectures/:lectureId/change-teacher
   */
  async changeLectureTeacher(lectureId: string, teacherId: string, reason?: string): Promise<Lecture> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}/change-teacher`, {
      method: 'POST',
      body: JSON.stringify({
        teacherId: teacherId.trim(),
        reason: reason?.trim() || 'Faculty substitute assignment',
      }),
    });
    const data = await handleApiResponse(res, 'Failed to assign substitute faculty');
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * POST /api/v1/timetable/lectures/extra
   */
  async createExtraLecture(params: {
    subjectId: string;
    divisionId: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: number | string;
    periodNumber: number;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }): Promise<Lecture> {
    const dayNum = typeof params.dayOfWeek === 'number'
      ? params.dayOfWeek
      : DAY_NAME_TO_NUMBER[String(params.dayOfWeek).toLowerCase()] || 1;

    const res = await fetchWithAuth('/api/v1/timetable/lectures/extra', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        dayOfWeek: dayNum,
      }),
    });
    const data = await handleApiResponse(res, 'Failed to schedule extra lecture');
    return normalizeBackendLecture(data.lecture);
  },

  /**
   * DELETE /api/v1/timetable/lectures/:lectureId
   */
  async deleteLecture(lectureId: string): Promise<boolean> {
    const res = await fetchWithAuth(`/api/v1/timetable/lectures/${encodeURIComponent(lectureId)}`, {
      method: 'DELETE',
    });
    await handleApiResponse(res, 'Failed to delete lecture');
    return true;
  },
};
