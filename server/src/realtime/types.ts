import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../middleware/authenticate.js';

export type TimetableEventType =
  | 'timetable:lecture_cancelled'
  | 'timetable:lecture_rescheduled'
  | 'timetable:lecture_room_changed'
  | 'timetable:lecture_teacher_changed'
  | 'timetable:lecture_created'
  | 'timetable:lecture_deleted';

export interface TimetableRealtimeEvent {
  eventType: TimetableEventType;
  lectureId: string;
  divisionId: string;
  divisionKey?: string;
  course?: string;
  year?: string;
  division?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  roomId?: string;
  roomName?: string;
  dayName?: string;
  timeSlot?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  changedByRole: UserRole;
  changedByUserId?: string;
  changedByName?: string;
  timestamp: string;
}

export interface SocketData {
  user: AuthenticatedUser;
  rooms: string[];
}

export interface ServerToClientEvents {
  'timetable:lecture_cancelled': (payload: TimetableRealtimeEvent) => void;
  'timetable:lecture_rescheduled': (payload: TimetableRealtimeEvent) => void;
  'timetable:lecture_room_changed': (payload: TimetableRealtimeEvent) => void;
  'timetable:lecture_teacher_changed': (payload: TimetableRealtimeEvent) => void;
  'timetable:lecture_created': (payload: TimetableRealtimeEvent) => void;
  'timetable:lecture_deleted': (payload: TimetableRealtimeEvent) => void;
}

export interface ClientToServerEvents {
  // Real-time server only accepts authenticated signals; clients do not arbitrarily emit timetable mutations
}
