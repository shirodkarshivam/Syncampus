import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  CheckCircle2 
} from 'lucide-react';
import './TeacherDashboard.css';
import type { Lecture } from '../../data/mockData';
import { findTeacherByQuery, getLecturesForTeacher, TEACHERS_DATA } from '../../data/teachersData';
import type { TeacherProfile } from '../../data/teachersData';
import { getLecturesForTeacherId } from '../../data/timetableData';
import { timetableStore, LectureChangeAlert } from '../../data/timetableStore';
import { getUserProfile, subscribeUserProfile } from '../../data/userProfileStore';
import { timetableApi } from '../../services/timetableApi';
import { 
  subscribeToTimetableEvents, 
  onRealtimeReconnect, 
  TimetableRealtimeEvent 
} from '../../services/realtime';

import { TeacherHomeView } from './views/TeacherHomeView';
import { TeacherTimetableView } from './views/TeacherTimetableView';
import { TeacherClassesView } from './views/TeacherClassesView';
import { TeacherProfileView } from './views/TeacherProfileView';
import { NotificationDrawer } from '../common/NotificationDrawer';

import { TeacherCancelModal } from './modals/TeacherCancelModal';
import { TeacherRescheduleModal } from './modals/TeacherRescheduleModal';
import { TeacherChangeRoomModal } from './modals/TeacherChangeRoomModal';

interface Props {
  teacherEmail?: string;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<Props> = ({ 
  teacherEmail = 'rahul.patil.t001@campus.edu', 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState<boolean>(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);

  // Dynamically resolve teacher profile from any query (email, ID, or name)
  const activeTeacher: TeacherProfile = useMemo(() => {
    return findTeacherByQuery(teacherEmail) || TEACHERS_DATA[0];
  }, [teacherEmail]);

  // Master conflict-free lectures synchronized with all student divisions
  const [myLectures, setMyLectures] = useState<Lecture[]>(() => {
    return timetableStore.getLecturesForTeacherId(activeTeacher.id, activeTeacher.name);
  });

  const [historyAlerts, setHistoryAlerts] = useState(() => {
    return timetableStore.getAllAlertsHistory('teacher', activeTeacher.id, activeTeacher.name);
  });

  const [profileData, setProfileData] = useState(() => {
    return getUserProfile(activeTeacher.email || activeTeacher.id);
  });

  // Authoritative Teacher Timetable Fetcher & Refresher
  const refreshTeacherTimetable = useCallback(async () => {
    try {
      const data = await timetableApi.getTeacherTimetable(activeTeacher.id);
      setMyLectures(data);
      timetableStore.setLectures(data);
      setHistoryAlerts(timetableStore.getAllAlertsHistory('teacher', activeTeacher.id, activeTeacher.name));
      return data;
    } catch (err: any) {
      console.warn('Backend teacher timetable fetch error, falling back to cache:', err);
      const fallback = timetableStore.getLecturesForTeacherId(activeTeacher.id, activeTeacher.name);
      if (fallback.length > 0) {
        setMyLectures(fallback);
      }
      throw err;
    }
  }, [activeTeacher.id, activeTeacher.name]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTimetable(true);
    setTimetableError(null);

    refreshTeacherTimetable()
      .then(() => {
        if (isMounted) setIsLoadingTimetable(false);
      })
      .catch((err) => {
        if (isMounted) {
          setTimetableError(err.message || 'Failed to load teacher schedule');
          setIsLoadingTimetable(false);
        }
      });

    const unsubTimetable = timetableStore.subscribe(() => {
      setHistoryAlerts(timetableStore.getAllAlertsHistory('teacher', activeTeacher.id, activeTeacher.name));
    });
    const unsubProfile = subscribeUserProfile(() => {
      setProfileData(getUserProfile(activeTeacher.email || activeTeacher.id));
    });

    // Real-Time Socket.IO event subscription for faculty schedule updates
    const unsubRealtime = subscribeToTimetableEvents((event: TimetableRealtimeEvent) => {
      console.log(`[TeacherDashboard] Received real-time timetable event: ${event.eventType}`, event);

      // Check if event targets this teacher or their teaching division
      const affectsTeacher =
        event.teacherId === activeTeacher.id ||
        event.substituteTeacherId === activeTeacher.id ||
        myLectures.some(l => l.id === event.lectureId || l.divisionKey === event.divisionKey);

      if (!affectsTeacher) {
        return;
      }

      // Re-fetch authoritative teacher schedule from backend
      refreshTeacherTimetable().catch(console.warn);

      // If action was initiated by another session/admin, record alert & notify
      const isInitiator = event.changedByUserId === activeTeacher.id;
      if (!isInitiator) {
        let alertType: 'cancelled' | 'rescheduled' | 'teacher_changed' | 'room_changed' = 'cancelled';
        if (event.eventType === 'timetable:lecture_cancelled') alertType = 'cancelled';
        else if (event.eventType === 'timetable:lecture_rescheduled') alertType = 'rescheduled';
        else if (event.eventType === 'timetable:lecture_room_changed') alertType = 'room_changed';
        else if (event.eventType === 'timetable:lecture_teacher_changed') alertType = 'teacher_changed';

        timetableStore.recordAlert({
          lectureId: event.lectureId,
          type: alertType,
          course: event.course || 'Curriculum',
          year: event.year || 'FY',
          division: event.division || 'A',
          divisionKey: event.divisionKey || `${event.course}_${event.year}_${event.division}`,
          subject: event.subjectName || 'Lecture',
          oldValue: event.oldValue,
          newValue: event.newValue,
          reason: event.reason,
          triggeredBy: event.changedByName || event.changedByRole || 'Admin / Faculty',
        });

        const actionWord = event.eventType.replace('timetable:lecture_', '').replace('_', ' ');
        showToast(`Schedule Update: ${event.subjectName || 'Lecture'} ${actionWord}`);
      }
    });

    // Reconnection resynchronization
    const unsubReconnect = onRealtimeReconnect(() => {
      console.log('[TeacherDashboard] Realtime connection restored, fetching authoritative schedule...');
      refreshTeacherTimetable().catch(console.warn);
    });

    return () => {
      isMounted = false;
      unsubTimetable();
      unsubProfile();
      unsubRealtime();
      unsubReconnect();
    };
  }, [activeTeacher, refreshTeacherTimetable, myLectures]);

  // Modal target states
  const [cancelModalLecture, setCancelModalLecture] = useState<Lecture | null>(null);
  const [rescheduleModalLecture, setRescheduleModalLecture] = useState<Lecture | null>(null);
  const [changeRoomModalLecture, setChangeRoomModalLecture] = useState<Lecture | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Teacher Actions - Direct backend API integration with conflict protection
  const handleConfirmCancel = async (id: string, reason: string) => {
    try {
      const cancelled = await timetableApi.cancelLecture(id, reason);
      await refreshTeacherTimetable();
      timetableStore.recordAlert({
        lectureId: id,
        type: 'cancelled',
        course: cancelled.course,
        year: cancelled.year || 'FY',
        division: cancelled.division,
        divisionKey: cancelled.divisionKey || `${cancelled.course}_${cancelled.year || 'FY'}_${cancelled.division}`,
        subject: cancelled.subject,
        oldValue: `${cancelled.day} • ${cancelled.time} (${cancelled.room})`,
        newValue: 'Lecture Cancelled',
        reason,
        triggeredBy: activeTeacher.title
      });
      showToast(`Lecture "${cancelled.subject}" cancelled (${reason}). Affected students notified.`);
    } catch (err: any) {
      console.error('Cancel lecture error:', err);
      showToast(`⚠️ Error: ${err.message || 'Failed to cancel lecture'}`);
    }
  };

  const handleConfirmReschedule = async (id: string, newTime: string, newRoom: string) => {
    try {
      const targetLec = myLectures.find(l => l.id === id);
      const targetDay = targetLec?.day || 'Monday';

      const updated = await timetableApi.rescheduleLecture(id, {
        dayOfWeek: targetDay,
        timeString: newTime,
        reason: 'Faculty timetable adjustment'
      });

      // If room also changed, update classroom on server
      if (newRoom && targetLec && newRoom !== targetLec.room) {
        await timetableApi.changeLectureRoom(id, newRoom, 'Room relocation during reschedule');
      }

      await refreshTeacherTimetable();
      timetableStore.recordAlert({
        lectureId: id,
        type: 'rescheduled',
        course: updated.course,
        year: updated.year || 'FY',
        division: updated.division,
        divisionKey: updated.divisionKey || `${updated.course}_${updated.year || 'FY'}_${updated.division}`,
        subject: updated.subject,
        oldValue: `${targetLec?.time || ''} • ${targetLec?.room || ''}`,
        newValue: `${newTime} • ${newRoom}`,
        reason: 'Timetable adjustment',
        triggeredBy: activeTeacher.title
      });
      showToast(`Rescheduled to ${newTime} in ${newRoom}. Central timetable synchronized.`);
    } catch (err: any) {
      console.error('Reschedule lecture error:', err);
      const conflictMsg = err.details?.conflicts?.[0]?.message || err.message || 'Schedule slot or room conflict detected.';
      showToast(`⚠️ Conflict: ${conflictMsg}`);
    }
  };

  const handleConfirmChangeRoom = async (id: string, newRoom: string) => {
    try {
      const targetLec = myLectures.find(l => l.id === id);
      const updated = await timetableApi.changeLectureRoom(id, newRoom, 'Room relocation requested by faculty');
      await refreshTeacherTimetable();
      timetableStore.recordAlert({
        lectureId: id,
        type: 'room_changed',
        course: updated.course,
        year: updated.year || 'FY',
        division: updated.division,
        divisionKey: updated.divisionKey || `${updated.course}_${updated.year || 'FY'}_${updated.division}`,
        subject: updated.subject,
        oldValue: `Classroom: ${targetLec?.room || ''}`,
        newValue: `Relocated to: ${newRoom}`,
        reason: 'Room relocation',
        triggeredBy: activeTeacher.title
      });
      showToast(`Classroom updated to ${newRoom}. Authoritative schedule synchronized.`);
    } catch (err: any) {
      console.error('Change room error:', err);
      const conflictMsg = err.details?.message || err.message || `Room ${newRoom} is already occupied at this time.`;
      showToast(`⚠️ Cannot Change Room: ${conflictMsg}`);
    }
  };

  // Academic day logic: if weekend (Sun/Sat), show Monday's upcoming schedule
  const defaultAcademicDay = useMemo(() => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'Monday';
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[dayIndex];
  }, []);

  const teacherInitials = activeTeacher.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'timetable', label: 'My Timetable', icon: <Calendar size={18} /> },
    { id: 'classes', label: 'My Classes', icon: <Users size={18} /> }
  ];

  return (
    <div className="teacher-layout">
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#0D9488" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`teacher-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #0D9488, #0F766E)' }}>
              <GraduationCap size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="sidebar-brand-name">SyncCampus</div>
              <span className="sidebar-role-tag teacher-tag">Faculty Portal</span>
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
      <div className="teacher-main-wrapper">
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
              SyncCampus / Faculty / <span className="current">{navItems.find(i => i.id === activeTab)?.label || 'Profile'}</span>
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
              className="teacher-profile-pill" 
              onClick={() => setActiveTab('profile')} 
              style={{ cursor: 'pointer' }}
              title="View Faculty Profile"
            >
              <div 
                className="teacher-profile-avatar"
                style={profileData.avatarUrl ? {
                  backgroundImage: `url(${profileData.avatarUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'transparent'
                } : {}}
              >
                {!profileData.avatarUrl && teacherInitials}
              </div>
              <div className="profile-info">
                <span className="profile-name">{activeTeacher.title}</span>
                <span className="profile-subtitle">Dept of {activeTeacher.department} ({activeTeacher.id})</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="teacher-content-area">
          {isLoadingTimetable && myLectures.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Loading official faculty schedule...</div>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <TeacherHomeView
                  teacher={activeTeacher}
                  lectures={myLectures}
                  defaultDay={defaultAcademicDay}
                  onOpenCancel={(lec) => setCancelModalLecture(lec)}
                  onOpenReschedule={(lec) => setRescheduleModalLecture(lec)}
                  onOpenChangeRoom={(lec) => setChangeRoomModalLecture(lec)}
                  onNavigateToTimetable={() => setActiveTab('timetable')}
                />
              )}

              {activeTab === 'timetable' && (
                <TeacherTimetableView
                  lectures={myLectures}
                  onOpenCancel={(lec) => setCancelModalLecture(lec)}
                  onOpenReschedule={(lec) => setRescheduleModalLecture(lec)}
                  onOpenChangeRoom={(lec) => setChangeRoomModalLecture(lec)}
                />
              )}

              {activeTab === 'classes' && (
                <TeacherClassesView teacher={activeTeacher} />
              )}

              {activeTab === 'profile' && (
                <TeacherProfileView 
                  teacher={activeTeacher}
                  email={activeTeacher.email} 
                  onLogout={onLogout} 
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeacherCancelModal
        isOpen={!!cancelModalLecture}
        onClose={() => setCancelModalLecture(null)}
        lecture={cancelModalLecture}
        onConfirmCancel={handleConfirmCancel}
      />

      <TeacherRescheduleModal
        isOpen={!!rescheduleModalLecture}
        onClose={() => setRescheduleModalLecture(null)}
        lecture={rescheduleModalLecture}
        onConfirmReschedule={handleConfirmReschedule}
      />

      <TeacherChangeRoomModal
        isOpen={!!changeRoomModalLecture}
        onClose={() => setChangeRoomModalLecture(null)}
        lecture={changeRoomModalLecture}
        onConfirmChangeRoom={handleConfirmChangeRoom}
      />

      {/* Bell Notification Drawer for Alert History & Dismissed Alerts */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        activeAlerts={historyAlerts.active}
        dismissedAlerts={historyAlerts.dismissed}
        onDismissAlert={(id) => timetableStore.dismissAlert(id)}
        onRestoreAlert={(id) => timetableStore.restoreAlert(id)}
        onMarkAllAsRead={() => timetableStore.markAllAlertsAsDismissed('teacher', activeTeacher.id, activeTeacher.name)}
        role="teacher"
        userName={activeTeacher.title}
      />
    </div>
  );
};

export default TeacherDashboard;
