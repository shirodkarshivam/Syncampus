import { getIO } from './socketServer.js';
import { TimetableRealtimeEvent, TimetableEventType } from './types.js';

export interface PersistentNotification {
  id: string;
  recipientUserId?: string | null;
  divisionId?: string | null;
  lectureId?: string | null;
  title: string;
  message: string;
  type: 'CANCELLATION' | 'RESCHEDULE' | 'ROOM_CHANGE' | 'TEACHER_CHANGE' | 'ANNOUNCEMENT';
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent notification store for fallback / verification mode
export const inMemoryNotifications: PersistentNotification[] = [];

export class EventPublisher {
  /**
   * Broadcasts a targeted timetable event across Socket.IO rooms and stores persistent notification
   */
  publishEvent(event: TimetableRealtimeEvent): void {
    const io = getIO();

    // 1. Create and store persistent notification audit
    const notification: PersistentNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      divisionId: event.divisionId,
      lectureId: event.lectureId,
      title: this.formatNotificationTitle(event),
      message: this.formatNotificationMessage(event),
      type: this.mapEventTypeToNotificationType(event.eventType),
      isRead: false,
      isDismissed: false,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
    };
    inMemoryNotifications.unshift(notification);

    if (!io) {
      console.log(`[EventPublisher] No active Socket.IO server. Event queued in audit log: ${event.eventType}`);
      return;
    }

    // 2. Targeted Delivery: Student Division Room
    if (event.divisionId) {
      io.to(`division:${event.divisionId}`).emit(event.eventType, event);
    }

    // 3. Targeted Delivery: Assigned Faculty Room
    if (event.teacherId) {
      io.to(`teacher:${event.teacherId}`).emit(event.eventType, event);
    }

    // 4. Targeted Delivery: Substitute Faculty Room (if applicable)
    if (event.substituteTeacherId && event.substituteTeacherId !== event.teacherId) {
      io.to(`teacher:${event.substituteTeacherId}`).emit(event.eventType, event);
    }

    // 5. Targeted Delivery: Administration Room
    io.to('admin').emit(event.eventType, event);

    console.log(
      `[EventPublisher] Emitted ${event.eventType} for lecture ${event.lectureId} to [division:${event.divisionId}, teacher:${event.teacherId}, admin]`
    );
  }

  private mapEventTypeToNotificationType(type: TimetableEventType): PersistentNotification['type'] {
    switch (type) {
      case 'timetable:lecture_cancelled':
        return 'CANCELLATION';
      case 'timetable:lecture_rescheduled':
        return 'RESCHEDULE';
      case 'timetable:lecture_room_changed':
        return 'ROOM_CHANGE';
      case 'timetable:lecture_teacher_changed':
        return 'TEACHER_CHANGE';
      default:
        return 'ANNOUNCEMENT';
    }
  }

  private formatNotificationTitle(event: TimetableRealtimeEvent): string {
    switch (event.eventType) {
      case 'timetable:lecture_cancelled':
        return `Lecture Cancelled: ${event.subjectName || 'Session'}`;
      case 'timetable:lecture_rescheduled':
        return `Lecture Rescheduled: ${event.subjectName || 'Session'}`;
      case 'timetable:lecture_room_changed':
        return `Room Relocation: ${event.subjectName || 'Session'}`;
      case 'timetable:lecture_teacher_changed':
        return `Faculty Reassigned: ${event.subjectName || 'Session'}`;
      case 'timetable:lecture_created':
        return `New Lecture Added: ${event.subjectName || 'Session'}`;
      case 'timetable:lecture_deleted':
        return `Lecture Removed: ${event.subjectName || 'Session'}`;
    }
  }

  private formatNotificationMessage(event: TimetableRealtimeEvent): string {
    switch (event.eventType) {
      case 'timetable:lecture_cancelled':
        return `${event.subjectName} on ${event.dayName || 'scheduled day'} (${event.timeSlot || ''}) was cancelled. Reason: ${event.reason || 'Administrative decision'}.`;
      case 'timetable:lecture_rescheduled':
        return `${event.subjectName} has been rescheduled to ${event.newValue || `${event.dayName} ${event.timeSlot}`}. Reason: ${event.reason || 'Timetable update'}.`;
      case 'timetable:lecture_room_changed':
        return `${event.subjectName} has been relocated to ${event.roomName || event.roomId}. Reason: ${event.reason || 'Room adjustment'}.`;
      case 'timetable:lecture_teacher_changed':
        return `${event.subjectName} instructor reassigned to ${event.substituteTeacherName || event.substituteTeacherId}. Reason: ${event.reason || 'Faculty reassignment'}.`;
      case 'timetable:lecture_created':
        return `Extra lecture for ${event.subjectName} scheduled in ${event.roomName || event.roomId} on ${event.dayName} (${event.timeSlot}).`;
      case 'timetable:lecture_deleted':
        return `${event.subjectName} lecture (${event.lectureId}) was removed from the official schedule.`;
    }
  }
}

export const eventPublisher = new EventPublisher();
