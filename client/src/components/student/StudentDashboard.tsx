import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Bell,
  CheckCircle2
} from 'lucide-react';
import './StudentDashboard.css';
import type { Lecture } from '../../data/mockData';
import { findStudentByQuery, STUDENTS_DATA } from '../../data/studentsData';
import type { Student } from '../../data/studentsData';
import { 
  getLecturesForStudent, 
  getSubjectsForStudent, 
  getAssignedTeachersForStudent 
} from '../../data/timetableData';
import { timetableStore, LectureChangeAlert } from '../../data/timetableStore';
import { getUserProfile, subscribeUserProfile } from '../../data/userProfileStore';
import { timetableApi } from '../../services/timetableApi';
import { 
  subscribeToTimetableEvents, 
  onRealtimeReconnect, 
  TimetableRealtimeEvent 
} from '../../services/realtime';

import { StudentHomeView } from './views/StudentHomeView';
import { StudentTimetableView } from './views/StudentTimetableView';
import { StudentProfileView } from './views/StudentProfileView';
import { NotificationDrawer } from '../common/NotificationDrawer';

interface Props {
  studentEmail?: string;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<Props> = ({
  studentEmail = 'stu0001@sonopantcollege.edu.in',
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState<boolean>(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically resolve student profile from any query (email, ID, or name)
  const activeStudent: Student = useMemo(() => {
    return findStudentByQuery(studentEmail) || STUDENTS_DATA[0];
  }, [studentEmail]);

  const studentDivKey = useMemo(() => {
    return `${activeStudent.course}_${activeStudent.year}_${activeStudent.division}`;
  }, [activeStudent]);

  // Master conflict-free timetable loaded authoritatively from backend
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    return timetableStore.getLecturesForStudent(activeStudent);
  });
  const [alerts, setAlerts] = useState<LectureChangeAlert[]>(() => {
    return timetableStore.getAlertsForStudent(activeStudent);
  });
  const [historyAlerts, setHistoryAlerts] = useState(() => {
    return timetableStore.getAllAlertsHistory('student', studentDivKey);
  });

  // Custom user profile from userProfileStore (avatar, contact, password)
  const [profileData, setProfileData] = useState(() => {
    return getUserProfile(activeStudent.email || activeStudent.id);
  });

  // Authoritative Backend Timetable Fetch
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTimetable(true);
    setTimetableError(null);

    timetableApi.getStudentTimetable()
      .then((backendLectures) => {
        if (!isMounted) return;
        setLectures(backendLectures);
        timetableStore.setLectures(backendLectures);
        setAlerts(timetableStore.getAlertsForStudent(activeStudent));
        setHistoryAlerts(timetableStore.getAllAlertsHistory('student', studentDivKey));
        setIsLoadingTimetable(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Backend student timetable load error, checking in-memory fallback:', err);
        const fallback = timetableStore.getLecturesForStudent(activeStudent);
        if (fallback.length > 0) {
          setLectures(fallback);
        }
        setTimetableError(err.message || 'Failed to load timetable from server');
        setIsLoadingTimetable(false);
      });

    const unsubTimetable = timetableStore.subscribe(() => {
      setAlerts(timetableStore.getAlertsForStudent(activeStudent));
      setHistoryAlerts(timetableStore.getAllAlertsHistory('student', studentDivKey));
    });
    const unsubProfile = subscribeUserProfile(() => {
      setProfileData(getUserProfile(activeStudent.email || activeStudent.id));
    });

    // Real-Time Socket.IO event subscription for instant targeted synchronization
    const unsubRealtime = subscribeToTimetableEvents((event: TimetableRealtimeEvent) => {
      console.log(`[StudentDashboard] Received real-time timetable event: ${event.eventType}`, event);

      // Re-fetch authoritative student timetable from backend REST API
      timetableApi.getStudentTimetable()
        .then((updatedLectures) => {
          if (!isMounted) return;
          setLectures(updatedLectures);
          timetableStore.setLectures(updatedLectures);
        })
        .catch((err) => {
          console.warn('[StudentDashboard] Error refreshing student timetable on real-time event:', err);
        });

      // Map event to student notification drawer alert
      let alertType: 'cancelled' | 'rescheduled' | 'teacher_changed' | 'room_changed' = 'cancelled';
      if (event.eventType === 'timetable:lecture_cancelled') alertType = 'cancelled';
      else if (event.eventType === 'timetable:lecture_rescheduled') alertType = 'rescheduled';
      else if (event.eventType === 'timetable:lecture_room_changed') alertType = 'room_changed';
      else if (event.eventType === 'timetable:lecture_teacher_changed') alertType = 'teacher_changed';

      timetableStore.recordAlert({
        lectureId: event.lectureId,
        type: alertType,
        course: event.course || activeStudent.course,
        year: event.year || activeStudent.year,
        division: event.division || activeStudent.division,
        divisionKey: event.divisionKey || studentDivKey,
        subject: event.subjectName || 'Curriculum Lecture',
        oldValue: event.oldValue,
        newValue: event.newValue,
        reason: event.reason,
        triggeredBy: event.changedByName || event.changedByRole || 'Faculty / Administration',
      });

      // Display live notification banner
      let notice = 'Timetable Updated';
      if (event.eventType === 'timetable:lecture_cancelled') {
        notice = `${event.subjectName || 'Lecture'} at ${event.timeSlot || 'scheduled time'} has been cancelled.`;
      } else if (event.eventType === 'timetable:lecture_rescheduled') {
        notice = `${event.subjectName || 'Lecture'} rescheduled: ${event.newValue || 'new slot'}`;
      } else if (event.eventType === 'timetable:lecture_room_changed') {
        notice = `Room changed to ${event.newValue || 'new room'} for ${event.subjectName || 'Lecture'}`;
      } else if (event.eventType === 'timetable:lecture_teacher_changed') {
        notice = `Faculty updated to ${event.newValue || 'Substitute'} for ${event.subjectName || 'Lecture'}`;
      } else if (event.eventType === 'timetable:lecture_created') {
        notice = `Extra lecture scheduled: ${event.subjectName || 'Lecture'} (${event.timeSlot || ''})`;
      } else if (event.eventType === 'timetable:lecture_deleted') {
        notice = `Lecture removed from schedule: ${event.subjectName || 'Lecture'}`;
      }

      setToastMessage(notice);
      setTimeout(() => {
        if (isMounted) setToastMessage(null);
      }, 5000);
    });

    // Reconnection resynchronization
    const unsubReconnect = onRealtimeReconnect(() => {
      console.log('[StudentDashboard] Realtime connection restored, fetching authoritative schedule...');
      timetableApi.getStudentTimetable()
        .then((updated) => {
          if (!isMounted) return;
          setLectures(updated);
          timetableStore.setLectures(updated);
        })
        .catch(console.warn);
    });

    return () => {
      isMounted = false;
      unsubTimetable();
      unsubProfile();
      unsubRealtime();
      unsubReconnect();
    };
  }, [activeStudent, studentDivKey]);

  // Registered curriculum subjects for this course & year
  const studentSubjects: string[] = useMemo(() => {
    return getSubjectsForStudent(activeStudent);
  }, [activeStudent]);

  // Specific teachers assigned to teach this division's subjects (dynamically reflects any faculty changes)
  const assignedTeachers = useMemo(() => {
    const map = new Map<string, { subject: string; teacherName: string; teacherId: string }>();
    lectures.forEach(l => {
      if (!map.has(l.subject)) {
        map.set(l.subject, {
          subject: l.subject,
          teacherName: l.teacher,
          teacherId: l.teacherId || ''
        });
      }
    });
    if (map.size > 0) return Array.from(map.values());
    return getAssignedTeachersForStudent(activeStudent);
  }, [lectures, activeStudent]);

  // Academic day logic: if weekend (Sun/Sat), show Monday's upcoming schedule
  const defaultAcademicDay = useMemo(() => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'Monday';
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[dayIndex];
  }, []);

  const studentInitials = activeStudent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  return (
    <div className="student-layout">
      {/* Sidebar Navigation (Desktop) */}
      <aside className={`student-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand-icon">
              <GraduationCap size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="sidebar-brand-name">SyncCampus</div>
              <span className="sidebar-role-tag student-tag">Student Portal</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="student-main-wrapper">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-breadcrumb">
              SyncCampus / Student / <span className="current">{navItems.find(i => i.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="icon-button" 
              title="Schedule Change Alerts & History"
              onClick={() => setIsNotificationDrawerOpen(true)}
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {historyAlerts.active.length > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    lineHeight: '13px',
                    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                    border: '1.5px solid #FFFFFF'
                  }}
                >
                  {historyAlerts.active.length}
                </span>
              )}
            </button>

            <div 
              className="student-profile-pill" 
              onClick={() => setActiveTab('profile')} 
              style={{ cursor: 'pointer' }}
              title="View Student Profile"
            >
              <div 
                className="student-profile-avatar"
                style={profileData.avatarUrl ? {
                  backgroundImage: `url(${profileData.avatarUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'transparent'
                } : {}}
              >
                {!profileData.avatarUrl && studentInitials}
              </div>
              <div className="profile-info">
                <span className="profile-name">Hi, {activeStudent.name.split(' ')[0]} 👋</span>
                <span className="profile-subtitle">{activeStudent.course} &bull; {activeStudent.year} (Div {activeStudent.division}) &bull; {activeStudent.classroom}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="student-content-area">
          {isLoadingTimetable && lectures.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Loading official division timetable...</div>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <StudentHomeView
                  student={activeStudent}
                  lectures={lectures}
                  alerts={alerts}
                  onDismissAlert={(id) => timetableStore.dismissAlert(id)}
                  defaultDay={defaultAcademicDay}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'timetable' && (
                <StudentTimetableView 
                  lectures={lectures} 
                  student={activeStudent} 
                />
              )}

              {activeTab === 'profile' && (
                <StudentProfileView 
                  student={activeStudent}
                  email={activeStudent.email}
                  subjects={studentSubjects}
                  assignedTeachers={assignedTeachers}
                  onLogout={onLogout} 
                />
              )}
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Real-time Timetable Notification Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0F172A',
          color: '#F8FAFC',
          border: '1px solid #10B981',
          borderRadius: '8px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(16, 185, 129, 0.2)',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Bell Notification Drawer for Alert History & Dismissed Alerts */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        activeAlerts={historyAlerts.active}
        dismissedAlerts={historyAlerts.dismissed}
        onDismissAlert={(id) => timetableStore.dismissAlert(id)}
        onRestoreAlert={(id) => timetableStore.restoreAlert(id)}
        onMarkAllAsRead={() => timetableStore.markAllAlertsAsDismissed('student', studentDivKey)}
        role="student"
        userName={activeStudent.name}
      />
    </div>
  );
};

export default StudentDashboard;
