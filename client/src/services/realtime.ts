import { io, Socket } from 'socket.io-client';
import { getAccessToken, isAuthEnabled, getDevRole } from './authApi';

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
  changedByRole: string;
  changedByUserId?: string;
  changedByName?: string;
  timestamp: string;
}

let socket: Socket | null = null;
let currentToken: string | null = null;

const eventListeners = new Set<(event: TimetableRealtimeEvent) => void>();
const reconnectListeners = new Set<() => void>();

/**
 * Initializes single authenticated Socket.IO connection for current session
 */
export function initRealtime(tokenOverride?: string): Socket | null {
  const token = tokenOverride || getAccessToken();

  if (isAuthEnabled && !token) {
    console.log('[Realtime] No auth token available; socket connection deferred');
    return null;
  }

  // If already connected with same auth state, reuse existing socket
  const effectiveAuthKey = token || `dev-${getDevRole()}`;
  if (socket && currentToken === effectiveAuthKey && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  currentToken = effectiveAuthKey;

  // Connect via relative path to support both dev proxy and production host
  socket = io('/', {
    path: '/socket.io',
    auth: { token: token || undefined, role: getDevRole() },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`[Realtime] Connected to SyncCampus live event gateway (ID: ${socket?.id})`);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Realtime] Live gateway connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Realtime] Live gateway disconnected:', reason);
  });

  // Reconnection resynchronization trigger
  socket.io.on('reconnect', (attempt) => {
    console.log(`[Realtime] Reconnected on attempt #${attempt}. Resynchronizing active timetable...`);
    reconnectListeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Error in reconnect listener:', e);
      }
    });
  });

  // Wire up incoming timetable mutation events
  const TIMETABLE_EVENTS: TimetableEventType[] = [
    'timetable:lecture_cancelled',
    'timetable:lecture_rescheduled',
    'timetable:lecture_room_changed',
    'timetable:lecture_teacher_changed',
    'timetable:lecture_created',
    'timetable:lecture_deleted',
  ];

  TIMETABLE_EVENTS.forEach((eventName) => {
    socket?.on(eventName, (payload: TimetableRealtimeEvent) => {
      console.log(`[Realtime] Received "${eventName}" for lecture ${payload.lectureId}`);
      eventListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (e) {
          console.error('Error invoking timetable event listener:', e);
        }
      });
    });
  });

  return socket;
}

/**
 * Disconnects socket and tears down state on logout
 */
export function disconnectRealtime(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}

/**
 * Subscribes to live timetable mutation events
 */
export function subscribeToTimetableEvents(
  listener: (event: TimetableRealtimeEvent) => void
): () => void {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}

/**
 * Subscribes to reconnection events to trigger automatic timetable refetching
 */
export function onRealtimeReconnect(callback: () => void): () => void {
  reconnectListeners.add(callback);
  return () => {
    reconnectListeners.delete(callback);
  };
}
