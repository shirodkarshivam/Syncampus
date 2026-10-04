import React, { useState, useEffect, useMemo } from 'react';
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
import { timetableStore } from '../../data/timetableStore';

import { TeacherHomeView } from './views/TeacherHomeView';
import { TeacherTimetableView } from './views/TeacherTimetableView';
import { TeacherClassesView } from './views/TeacherClassesView';
import { TeacherProfileView } from './views/TeacherProfileView';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically resolve teacher profile from any query (email, ID, or name)
  const activeTeacher: TeacherProfile = useMemo(() => {
    return findTeacherByQuery(teacherEmail) || TEACHERS_DATA[0];
  }, [teacherEmail]);

  // Master conflict-free lectures synchronized with all student divisions
  const [myLectures, setMyLectures] = useState<Lecture[]>(() => {
    return timetableStore.getLecturesForTeacherId(activeTeacher.id, activeTeacher.name);
  });

  useEffect(() => {
    const update = () => {
      setMyLectures(timetableStore.getLecturesForTeacherId(activeTeacher.id, activeTeacher.name));
    };
    update();
    const unsub = timetableStore.subscribe(update);
    return unsub;
  }, [activeTeacher]);

  // Modal target states
  const [cancelModalLecture, setCancelModalLecture] = useState<Lecture | null>(null);
  const [rescheduleModalLecture, setRescheduleModalLecture] = useState<Lecture | null>(null);
  const [changeRoomModalLecture, setChangeRoomModalLecture] = useState<Lecture | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Teacher Actions - Synchronized with timetableStore
  const handleConfirmCancel = (id: string, reason: string) => {
    const cancelled = timetableStore.cancelLecture(id, reason, activeTeacher.title);
    if (cancelled) {
      showToast(`Lecture "${cancelled.subject}" cancelled (${reason}). Affected students notified.`);
    }
  };

  const handleConfirmReschedule = (id: string, newTime: string, newRoom: string) => {
    const updated = timetableStore.rescheduleLecture(id, newTime, newRoom, undefined, undefined, activeTeacher.title);
    if (updated) {
      showToast(`Rescheduled to ${newTime} in ${newRoom}. Central timetable & students synchronized.`);
    }
  };

  const handleConfirmChangeRoom = (id: string, newRoom: string) => {
    const updated = timetableStore.changeRoom(id, newRoom, activeTeacher.title);
    if (updated) {
      showToast(`Classroom updated to ${newRoom}. Students notified automatically.`);
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

          <div className="topbar-right">
            <button 
              className="icon-button" 
              title="Notifications"
              onClick={() => showToast('Faculty Notice: Central conflict-free timetable active.')}
            >
              <Bell size={18} />
              <span className="notification-badge-dot" style={{ backgroundColor: '#0D9488' }} />
            </button>

            <div 
              className="teacher-profile-pill" 
              onClick={() => setActiveTab('profile')} 
              style={{ cursor: 'pointer' }}
              title="View Faculty Profile"
            >
              <div className="teacher-profile-avatar">{teacherInitials}</div>
              <div className="profile-info">
                <span className="profile-name">{activeTeacher.title}</span>
                <span className="profile-subtitle">Dept of {activeTeacher.department} ({activeTeacher.id})</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="teacher-content-area">
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
    </div>
  );
};

export default TeacherDashboard;
