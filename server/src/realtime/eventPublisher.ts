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

import { prisma, isDbConfigured } from '../config/database.js';
import { NotificationType } from '@prisma/client';

export class EventPublisher {
  /**
   * Broadcasts a targeted timetable event across Socket.IO rooms and stores persistent notification
   */
  async publishEvent(event: TimetableRealtimeEvent): Promise<void> {
    const io = getIO();

    // 1. Persist notification to PostgreSQL if configured
    if (isDbConfigured) {
      try {
        await this.persistNotificationToDb(event);
      } catch (err: any) {
        console.error('[EventPublisher] Error saving notification to PostgreSQL:', err.message);
      }
    }

    // Also keep in-memory for offline/fallback test compatibility
    const notification: PersistentNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      divisionId: event.divisionId,
      lectureId: event.lectureId,
      title: this.formatNotificationTitle(event),
      message: this.formatNotificationMessage(event),
      type: this.mapEventTypeToNotificationType(event.eventType),
      isRead: false,
      isDismissed: false,
      createdAt: event.timestamp || new Date().toISOString(),
      updatedAt: event.timestamp || new Date().toISOString(),
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

  /**
   * Persists targeted notification records directly in PostgreSQL
   */
  private async persistNotificationToDb(event: TimetableRealtimeEvent): Promise<void> {
    const notifType = this.mapEventTypeToNotificationType(event.eventType) as NotificationType;
    const title = this.formatNotificationTitle(event);
    const message = this.formatNotificationMessage(event);

    // 1. Resolve Division & targeted students
    let divisionRecord: any = null;
    if (event.divisionId) {
      divisionRecord = await prisma.division.findFirst({
        where: {
          OR: [
            { id: event.divisionId },
            { fullName: event.divisionId },
            { fullName: event.divisionId.replace(/_/g, '-') },
          ],
        },
        include: {
          students: {
            select: { userId: true },
          },
        },
      });
    }

    // 2. Resolve Teacher user
    let teacherUser: any = null;
    if (event.teacherId) {
      teacherUser = await prisma.teacher.findFirst({
        where: {
          OR: [
            { teacherId: event.teacherId },
            { id: event.teacherId },
          ],
        },
        select: { userId: true },
      });
    }

    // 3. Resolve Substitute Teacher user if applicable
    let substituteTeacherUser: any = null;
    if (event.substituteTeacherId && event.substituteTeacherId !== event.teacherId) {
      substituteTeacherUser = await prisma.teacher.findFirst({
        where: {
          OR: [
            { teacherId: event.substituteTeacherId },
            { id: event.substituteTeacherId },
          ],
        },
        select: { userId: true },
      });
    }

    // 4. Resolve Admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // 5. Check if lecture exists in DB (for foreign key integrity)
    let validLectureId: string | null = null;
    if (event.lectureId && event.eventType !== 'timetable:lecture_deleted') {
      const lecExists = await prisma.lecture.findUnique({
        where: { id: event.lectureId },
        select: { id: true },
      });
      if (lecExists) {
        validLectureId = lecExists.id;
      }
    }

    const recordsToInsert: any[] = [];

    // Targeted Students of the affected division ONLY
    if (divisionRecord && divisionRecord.students) {
      for (const student of divisionRecord.students) {
        recordsToInsert.push({
          recipientUserId: student.userId,
          divisionId: divisionRecord.id,
          lectureId: validLectureId,
          title,
          message,
          type: notifType,
          isRead: false,
          isDismissed: false,
        });
      }
    }

    // Affected Assigned Teacher
    if (teacherUser?.userId) {
      recordsToInsert.push({
        recipientUserId: teacherUser.userId,
        divisionId: divisionRecord?.id || null,
        lectureId: validLectureId,
        title,
        message,
        type: notifType,
        isRead: false,
        isDismissed: false,
      });
    }

    // Substitute Teacher
    if (substituteTeacherUser?.userId) {
      recordsToInsert.push({
        recipientUserId: substituteTeacherUser.userId,
        divisionId: divisionRecord?.id || null,
        lectureId: validLectureId,
        title,
        message,
        type: notifType,
        isRead: false,
        isDismissed: false,
      });
    }

    // Admin users
    for (const admin of adminUsers) {
      recordsToInsert.push({
        recipientUserId: admin.id,
        divisionId: divisionRecord?.id || null,
        lectureId: validLectureId,
        title,
        message,
        type: notifType,
        isRead: false,
        isDismissed: false,
      });
    }

    if (recordsToInsert.length > 0) {
      await prisma.notification.createMany({
        data: recordsToInsert,
      });
    }
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
