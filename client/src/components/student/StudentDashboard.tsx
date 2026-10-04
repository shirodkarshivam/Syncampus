import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap 
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

import { StudentHomeView } from './views/StudentHomeView';
import { StudentTimetableView } from './views/StudentTimetableView';
import { StudentProfileView } from './views/StudentProfileView';

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

  // Dynamically resolve student profile from any query (email, ID, or name)
  const activeStudent: Student = useMemo(() => {
    return findStudentByQuery(studentEmail) || STUDENTS_DATA[0];
  }, [studentEmail]);

  // Master conflict-free timetable for this student's exact division from timetableStore
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    return timetableStore.getLecturesForStudent(activeStudent);
  });
  const [alerts, setAlerts] = useState<LectureChangeAlert[]>(() => {
    return timetableStore.getAlertsForStudent(activeStudent);
  });

  useEffect(() => {
    const update = () => {
      setLectures(timetableStore.getLecturesForStudent(activeStudent));
      setAlerts(timetableStore.getAlertsForStudent(activeStudent));
    };
    update();
    const unsub = timetableStore.subscribe(update);
    return unsub;
  }, [activeStudent]);

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

          <div className="topbar-right">
            <div 
              className="student-profile-pill" 
              onClick={() => setActiveTab('profile')} 
              style={{ cursor: 'pointer' }}
              title="View Student Profile"
            >
              <div className="student-profile-avatar">{studentInitials}</div>
              <div className="profile-info">
                <span className="profile-name">Hi, {activeStudent.name.split(' ')[0]} 👋</span>
                <span className="profile-subtitle">{activeStudent.course} &bull; {activeStudent.year} (Div {activeStudent.division}) &bull; {activeStudent.classroom}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="student-content-area">
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
    </div>
  );
};

export default StudentDashboard;
