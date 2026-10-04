import { INITIAL_ALL_LECTURES, ScheduledLecture, MASTER_TIMETABLE, toLectureFormat } from './timetableData';
import type { Lecture } from './mockData';
import type { Student } from './studentsData';

const STORAGE_KEY_LECTURES = 'syncampus_master_timetable_v3';
const STORAGE_KEY_ALERTS = 'syncampus_timetable_alerts_v3';

export interface LectureChangeAlert {
  id: string;
  lectureId: string;
  type: 'cancelled' | 'rescheduled' | 'teacher_changed' | 'room_changed';
  course: string;
  year: string;
  division: string;
  divisionKey: string;
  subject: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  triggeredBy: string;
  timestamp: string;
  dismissed?: boolean;
}

// In-memory cache
let lecturesCache: Lecture[] | null = null;
let alertsCache: LectureChangeAlert[] | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying timetableStore listener', e);
    }
  });

  // Cross-component / cross-window event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('syncampus_timetable_update'));
  }
}

// Listen to storage event if other tabs/windows make changes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_LECTURES || e.key === STORAGE_KEY_ALERTS) {
      lecturesCache = null;
      alertsCache = null;
      notifyListeners();
    }
  });
}

function loadLectures(): Lecture[] {
  if (lecturesCache) return lecturesCache;
  if (typeof window === 'undefined') return INITIAL_ALL_LECTURES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_LECTURES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        lecturesCache = parsed;
        return lecturesCache;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached lectures, falling back to default', err);
  }

  lecturesCache = [...INITIAL_ALL_LECTURES];
  saveLectures(lecturesCache);
  return lecturesCache;
}

function saveLectures(lectures: Lecture[]) {
  lecturesCache = lectures;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LECTURES, JSON.stringify(lectures));
    } catch (err) {
      console.error('Failed to save lectures to localStorage', err);
    }
  }
}

function loadAlerts(): LectureChangeAlert[] {
  if (alertsCache) return alertsCache;
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        alertsCache = parsed;
        return alertsCache;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached alerts', err);
  }

  alertsCache = [];
  return alertsCache;
}

function saveAlerts(alerts: LectureChangeAlert[]) {
  alertsCache = alerts;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (err) {
      console.error('Failed to save alerts to localStorage', err);
    }
  }
}

function createAlert(alert: Omit<LectureChangeAlert, 'id' | 'timestamp'>) {
  const alerts = loadAlerts();
  const newAlert: LectureChangeAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  saveAlerts([newAlert, ...alerts]);
}

export const timetableStore = {
  // Read operations
  getAllLectures(): Lecture[] {
    return loadLectures();
  },

  getLecturesForStudent(student: Student): Lecture[] {
    const all = loadLectures();
    const divKey = `${student.course}_${student.year}_${student.division}`;
    const matches = all.filter(l => l.divisionKey === divKey || (l.course === student.course && l.year === student.year && l.division === student.division));
    if (matches.length > 0) return matches;
    return all.filter(l => l.course === student.course && l.year === student.year).slice(0, 25);
  },

  getLecturesForTeacherId(teacherId: string, teacherName?: string): Lecture[] {
    const all = loadLectures();
    const tid = teacherId.toLowerCase();
    const tname = (teacherName || '').toLowerCase();
    return all.filter(l => {
      if (l.teacherId && l.teacherId.toLowerCase() === tid) return true;
      if (tname && l.teacher.toLowerCase().includes(tname)) return true;
      return false;
    });
  },

  getAllAlerts(): LectureChangeAlert[] {
    return loadAlerts();
  },

  getAlertsForStudent(student: Student): LectureChangeAlert[] {
    const alerts = loadAlerts();
    const divKey = `${student.course}_${student.year}_${student.division}`;
    return alerts.filter(a => a.divisionKey === divKey && !a.dismissed);
  },

  dismissAlert(id: string) {
    const alerts = loadAlerts().map(a => a.id === id ? { ...a, dismissed: true } : a);
    saveAlerts(alerts);
    notifyListeners();
  },

  // Write operations
  cancelLecture(id: string, reason = 'Cancelled by administration', triggeredBy = 'Admin'): Lecture | null {
    const all = loadLectures();
    const target = all.find(l => l.id === id);
    if (!target) return null;

    const updatedLec: Lecture = {
      ...target,
      status: 'Cancelled' as const,
      cancelReason: reason,
      updatedAt: new Date().toLocaleTimeString()
    };

    const nextLectures = all.map(l => l.id === id ? updatedLec : l);
    saveLectures(nextLectures);

    createAlert({
      lectureId: id,
      type: 'cancelled',
      course: updatedLec.course,
      year: updatedLec.year || (updatedLec.semester <= 2 ? 'FY' : updatedLec.semester <= 4 ? 'SY' : 'TY'),
      division: updatedLec.division,
      divisionKey: updatedLec.divisionKey || `${updatedLec.course}_${updatedLec.year || 'FY'}_${updatedLec.division}`,
      subject: updatedLec.subject,
      oldValue: `${updatedLec.day} • ${updatedLec.time} (${updatedLec.room})`,
      newValue: 'Lecture Cancelled',
      reason,
      triggeredBy
    });

    notifyListeners();
    return updatedLec;
  },

  rescheduleLecture(
    id: string, 
    newTime: string, 
    newRoom: string, 
    newDay?: string, 
    newTeacher?: string,
    triggeredBy = 'Admin'
  ): Lecture | null {
    const all = loadLectures();
    const target = all.find(l => l.id === id);
    if (!target) return null;

    const origTime = target.originalTime || target.time;
    const origRoom = target.originalRoom || target.room;
    const origTeacher = target.originalTeacher || target.teacher;

    const updatedLec: Lecture = {
      ...target,
      originalTime: origTime,
      originalRoom: origRoom,
      originalTeacher: origTeacher,
      time: newTime,
      room: newRoom,
      day: newDay || target.day,
      teacher: newTeacher || target.teacher,
      status: 'Rescheduled' as const,
      updatedAt: new Date().toLocaleTimeString()
    };

    const nextLectures = all.map(l => l.id === id ? updatedLec : l);
    saveLectures(nextLectures);

    createAlert({
      lectureId: id,
      type: 'rescheduled',
      course: updatedLec.course,
      year: updatedLec.year || (updatedLec.semester <= 2 ? 'FY' : updatedLec.semester <= 4 ? 'SY' : 'TY'),
      division: updatedLec.division,
      divisionKey: updatedLec.divisionKey || `${updatedLec.course}_${updatedLec.year || 'FY'}_${updatedLec.division}`,
      subject: updatedLec.subject,
      oldValue: `${origTime} • ${origRoom}`,
      newValue: `${newTime} • ${newRoom}${newTeacher ? ` • ${newTeacher}` : ''}`,
      reason: 'Timetable adjustment',
      triggeredBy
    });

    notifyListeners();
    return updatedLec;
  },

  changeTeacher(id: string, newTeacherName: string, newTeacherId?: string, triggeredBy = 'Admin'): Lecture | null {
    const all = loadLectures();
    const target = all.find(l => l.id === id);
    if (!target) return null;

    const origTeacher = target.originalTeacher || target.teacher;
    const updatedLec: Lecture = {
      ...target,
      originalTeacher: origTeacher,
      teacher: newTeacherName,
      teacherId: newTeacherId || target.teacherId,
      status: 'Rescheduled' as const,
      updatedAt: new Date().toLocaleTimeString()
    };

    const nextLectures = all.map(l => l.id === id ? updatedLec : l);
    saveLectures(nextLectures);

    createAlert({
      lectureId: id,
      type: 'teacher_changed',
      course: updatedLec.course,
      year: updatedLec.year || (updatedLec.semester <= 2 ? 'FY' : updatedLec.semester <= 4 ? 'SY' : 'TY'),
      division: updatedLec.division,
      divisionKey: updatedLec.divisionKey || `${updatedLec.course}_${updatedLec.year || 'FY'}_${updatedLec.division}`,
      subject: updatedLec.subject,
      oldValue: `Faculty: ${origTeacher}`,
      newValue: `New Faculty: ${newTeacherName}`,
      reason: 'Instructor reassigned / Substitute faculty',
      triggeredBy
    });

    notifyListeners();
    return updatedLec;
  },

  changeRoom(id: string, newRoom: string, triggeredBy = 'Admin'): Lecture | null {
    const all = loadLectures();
    const target = all.find(l => l.id === id);
    if (!target) return null;

    const origRoom = target.originalRoom || target.room;
    const updatedLec: Lecture = {
      ...target,
      originalRoom: origRoom,
      room: newRoom,
      updatedAt: new Date().toLocaleTimeString()
    };

    const nextLectures = all.map(l => l.id === id ? updatedLec : l);
    saveLectures(nextLectures);

    createAlert({
      lectureId: id,
      type: 'room_changed',
      course: updatedLec.course,
      year: updatedLec.year || (updatedLec.semester <= 2 ? 'FY' : updatedLec.semester <= 4 ? 'SY' : 'TY'),
      division: updatedLec.division,
      divisionKey: updatedLec.divisionKey || `${updatedLec.course}_${updatedLec.year || 'FY'}_${updatedLec.division}`,
      subject: updatedLec.subject,
      oldValue: `Classroom: ${origRoom}`,
      newValue: `Relocated to: ${newRoom}`,
      reason: 'Room relocation',
      triggeredBy
    });

    notifyListeners();
    return updatedLec;
  },

  restoreLecture(id: string): Lecture | null {
    const all = loadLectures();
    const target = all.find(l => l.id === id);
    if (!target) return null;

    const updatedLec: Lecture = {
      ...target,
      status: 'Scheduled' as const,
      cancelReason: undefined,
      updatedAt: new Date().toLocaleTimeString()
    };

    const nextLectures = all.map(l => l.id === id ? updatedLec : l);
    saveLectures(nextLectures);
    notifyListeners();
    return updatedLec;
  },

  addLecture(newLecture: Lecture): Lecture {
    const all = loadLectures();
    const updated = [newLecture, ...all];
    saveLectures(updated);
    notifyListeners();
    return newLecture;
  },

  deleteLecture(id: string): boolean {
    const all = loadLectures();
    const filtered = all.filter(l => l.id !== id);
    saveLectures(filtered);
    notifyListeners();
    return true;
  },

  resetToDefaults(): void {
    lecturesCache = [...INITIAL_ALL_LECTURES];
    alertsCache = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_LECTURES);
      localStorage.removeItem(STORAGE_KEY_ALERTS);
    }
    notifyListeners();
  },

  // Pub-sub
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
