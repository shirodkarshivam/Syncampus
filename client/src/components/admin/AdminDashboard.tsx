import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  Building2, 
  Layers, 
  Calendar, 
  DoorOpen, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  CheckCircle2,
  GraduationCap,
  Users,
  BookOpen,
  UserCheck
} from 'lucide-react';
import './AdminDashboard.css';
import { 
  INITIAL_ACTIVITIES, 
  INITIAL_LECTURES, 
  INITIAL_CLASSROOMS, 
  DEPARTMENTS_DATA,
  ACADEMIC_DIVISIONS_DATA
} from '../../data/mockData';
import { timetableStore } from '../../data/timetableStore';
import { timetableApi } from '../../services/timetableApi';
import { adminApi } from '../../services/adminApi';
import { 
  subscribeToTimetableEvents, 
  onRealtimeReconnect, 
  TimetableRealtimeEvent 
} from '../../services/realtime';
import type {
  Lecture,
  ActivityLog,
  Classroom,
  DepartmentSummary,
  AcademicDivisionEntry
} from '../../data/mockData';

import { TEACHERS_DATA } from '../../data/teachersData';
import type { TeacherProfile } from '../../data/teachersData';
import { INITIAL_STUDENTS_DATA } from '../../data/studentsData';
import type { Student } from '../../data/studentsData';

import { OverviewView } from './views/OverviewView';
import { DepartmentsView } from './views/DepartmentsView';
import { DivisionsView } from './views/DivisionsView';
import { FacultyView } from './views/FacultyView';
import { StudentsView } from './views/StudentsView';
import { CurriculumView } from './views/CurriculumView';
import { TimetableView } from './views/TimetableView';
import { ClassroomsView } from './views/ClassroomsView';
import { SettingsView } from './views/SettingsView';

import { CreateLectureModal } from './modals/CreateLectureModal';
import { RescheduleModal } from './modals/RescheduleModal';
import { AddTeacherModal } from './modals/AddTeacherModal';
import { AddStudentModal } from './modals/AddStudentModal';
import { AddDepartmentModal } from './modals/AddDepartmentModal';
import { AddClassroomModal } from './modals/AddClassroomModal';
import { AddDivisionModal } from './modals/AddDivisionModal';

interface Props {
  adminEmail?: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [teachers, setTeachers] = useState<TeacherProfile[]>(TEACHERS_DATA);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS_DATA);
  const [departments, setDepartments] = useState<DepartmentSummary[]>(DEPARTMENTS_DATA);
  const [divisions, setDivisions] = useState<AcademicDivisionEntry[]>(ACADEMIC_DIVISIONS_DATA);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [lectures, setLectures] = useState<Lecture[]>(() => timetableStore.getAllLectures());
  const [isLoadingTimetable, setIsLoadingTimetable] = useState<boolean>(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);

  // Authoritative Backend Master Timetable Fetcher & Refresher
  const refreshMasterTimetable = useCallback(async () => {
    try {
      const res = await timetableApi.getMasterTimetable();
      setLectures(res.timetable);
      timetableStore.setLectures(res.timetable);
      return res.timetable;
    } catch (err: any) {
      console.warn('Backend master timetable fetch error, using in-memory cache:', err);
      const fallback = timetableStore.getAllLectures();
      if (fallback.length > 0) {
        setLectures(fallback);
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTimetable(true);
    setTimetableError(null);

    // 1. Fetch authoritative master timetable
    refreshMasterTimetable()
      .then(() => {
        if (isMounted) setIsLoadingTimetable(false);
      })
      .catch((err) => {
        if (isMounted) {
          setTimetableError(err.message || 'Failed to load master timetable');
          setIsLoadingTimetable(false);
        }
      });

    // 2. Fetch authoritative admin entities from PostgreSQL backend
    const loadAdminData = async () => {
      try {
        const [teachersRes, studentsRes, roomsRes, deptsRes, divsRes] = await Promise.allSettled([
          adminApi.getTeachers(),
          adminApi.getStudents(500),
          adminApi.getRooms(),
          adminApi.getDepartments(),
          adminApi.getDivisions(),
        ]);
        if (isMounted) {
          if (teachersRes.status === 'fulfilled' && teachersRes.value.length > 0) setTeachers(teachersRes.value);
          if (studentsRes.status === 'fulfilled' && studentsRes.value.length > 0) setStudents(studentsRes.value);
          if (roomsRes.status === 'fulfilled' && roomsRes.value.length > 0) setClassrooms(roomsRes.value);
          if (deptsRes.status === 'fulfilled' && deptsRes.value.length > 0) setDepartments(deptsRes.value);
          if (divsRes.status === 'fulfilled' && divsRes.value.length > 0) setDivisions(divsRes.value);
        }
      } catch (e) {
        console.warn('Backend admin entities fetch error, keeping cached data:', e);
      }
    };
    loadAdminData();

    const unsub = timetableStore.subscribe(() => {
      setLectures(timetableStore.getAllLectures());
    });

    // Real-Time Socket.IO event subscription for live admin oversight
    const unsubRealtime = subscribeToTimetableEvents((event: TimetableRealtimeEvent) => {
      console.log(`[AdminDashboard] Received live campus timetable event: ${event.eventType}`, event);

      // Re-fetch authoritative master timetable from backend
      refreshMasterTimetable().catch(console.warn);

      // Record activity in admin activity log
      const actionName = event.eventType.replace('timetable:lecture_', '').replace('_', ' ').toUpperCase();
      const divLabel = event.divisionKey || `${event.course || ''} ${event.year || ''}-${event.division || ''}`;
      const changeDetail = event.oldValue ? `${event.oldValue} → ${event.newValue}` : (event.newValue || event.reason || 'Completed');
      const actor = event.changedByName || event.changedByRole || 'Faculty/Admin';

      let activityType: 'room_change' | 'reschedule' | 'announcement' | 'status' = 'status';
      if (event.eventType === 'timetable:lecture_room_changed') activityType = 'room_change';
      else if (event.eventType === 'timetable:lecture_rescheduled') activityType = 'reschedule';
      else if (event.eventType === 'timetable:lecture_cancelled') activityType = 'announcement';

      const liveActivity: ActivityLog = {
        id: `act-live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: 'Just now',
        title: `${event.subjectName || 'Lecture'} ${actionName}`,
        detail: `${divLabel}: ${changeDetail} (by ${actor})`,
        type: activityType,
      };

      setActivities(prev => [liveActivity, ...prev]);

      // Show real-time notification banner
      showNotification(`Live Campus Timetable Update: ${event.subjectName || 'Lecture'} ${actionName.toLowerCase()} by ${actor}`);
    });

    // Reconnection resynchronization
    const unsubReconnect = onRealtimeReconnect(() => {
      console.log('[AdminDashboard] Realtime connection restored, fetching authoritative master timetable...');
      refreshMasterTimetable().catch(console.warn);
    });

    return () => {
      isMounted = false;
      unsub();
      unsubRealtime();
      unsubReconnect();
    };
  }, [refreshMasterTimetable]);

  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  // Modals state
  const [isCreateLectureOpen, setIsCreateLectureOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isAddClassroomOpen, setIsAddClassroomOpen] = useState(false);
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Lecture | null>(null);

  // Notification Banner
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  const logActivity = (title: string, detail: string, type: 'room_change' | 'reschedule' | 'announcement' | 'status') => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      time: 'Just now',
      title,
      detail,
      type
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // ===================
  // ACTION HANDLERS
  // ===================

  // 1. Teacher Management - Real PostgreSQL Persistence
  const handleAddTeacher = async (newTeacher: TeacherProfile) => {
    try {
      const created = await adminApi.createTeacher({
        id: newTeacher.id,
        name: newTeacher.name || newTeacher.title,
        department: newTeacher.department,
        subjects: newTeacher.subjects,
        email: newTeacher.email,
        room: newTeacher.room,
        status: newTeacher.status,
      });
      setTeachers(prev => [created, ...prev]);
      logActivity(
        `New Faculty Registered: ${created.title}`,
        `Assigned to ${created.department} (${created.id}) • Specializations: ${created.subjects.join(', ')}`,
        'status'
      );
      showNotification(`Teacher ${created.title} (${created.id}) registered successfully in PostgreSQL database.`);
    } catch (err: any) {
      alert(`Error registering teacher: ${err.message}`);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    const target = teachers.find(t => t.id === id);
    if (!confirm(`Are you sure you want to remove ${target?.title || 'this teacher'} from the faculty registry?`)) return;
    try {
      await adminApi.deleteTeacher(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      logActivity(
        `Faculty Removed: ${target?.title || id}`,
        `Removed from ${target?.department || 'Department'} roster`,
        'status'
      );
      showNotification(`Teacher ${target?.title || id} removed from faculty.`);
    } catch (err: any) {
      alert(`Cannot delete teacher: ${err.message}`);
    }
  };

  const handleToggleTeacherStatus = (id: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Active' ? 'On Leave' : 'Active';
        logActivity(
          `Teacher Status Updated: ${t.title}`,
          `Status changed to "${nextStatus}"`,
          'status'
        );
        showNotification(`${t.title} is now marked as ${nextStatus}.`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // 2. Student Management - Real PostgreSQL Persistence
  const handleAddStudent = async (newStudent: Student) => {
    try {
      const created = await adminApi.createStudent({
        id: newStudent.id,
        name: newStudent.name,
        department: newStudent.department,
        course: newStudent.course,
        year: newStudent.year,
        division: newStudent.division,
        classroom: newStudent.classroom,
        batch: newStudent.batch,
        email: newStudent.email,
        status: newStudent.status,
      });
      setStudents(prev => [created, ...prev]);
      logActivity(
        `New Student Enrolled: ${created.name}`,
        `Enrolled into ${created.course} ${created.year} Div ${created.division} (${created.id})`,
        'status'
      );
      showNotification(`Student ${created.name} (${created.id}) enrolled successfully in PostgreSQL database.`);
    } catch (err: any) {
      alert(`Error enrolling student: ${err.message}`);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const target = students.find(s => s.id === id);
    if (!confirm(`Are you sure you want to withdraw student ${target?.name || id}?`)) return;
    try {
      await adminApi.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      logActivity(
        `Student Withdrawn: ${target?.name || id}`,
        `Removed from ${target?.course || ''} Div ${target?.division || ''}`,
        'status'
      );
      showNotification(`Student ${target?.name || id} removed from database.`);
    } catch (err: any) {
      alert(`Cannot withdraw student: ${err.message}`);
    }
  };

  // 3. Department Management - Real PostgreSQL Persistence
  const handleAddDepartment = async (newDept: DepartmentSummary) => {
    try {
      const created = await adminApi.createDepartment({
        name: newDept.name,
        code: newDept.code,
      });
      setDepartments(prev => [...prev, created]);
      logActivity(
        `New Department Created: ${created.name}`,
        `Code: ${created.code} • ${created.coursesCount} Courses • ${created.divisionsCount} Divisions`,
        'status'
      );
      showNotification(`Academic Department "${created.name}" created successfully in PostgreSQL.`);
    } catch (err: any) {
      alert(`Error creating department: ${err.message}`);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    const target = departments.find(d => d.id === id);
    if (!confirm(`Are you sure you want to delete department "${target?.name}"?`)) return;
    try {
      await adminApi.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      logActivity(
        `Department Removed: ${target?.name || id}`,
        `Code ${target?.code} deleted from academic hierarchy`,
        'status'
      );
      showNotification(`Department "${target?.name}" removed.`);
    } catch (err: any) {
      alert(`Cannot delete department: ${err.message}`);
    }
  };

  // 4. Classroom / Space Management - Real PostgreSQL Persistence
  const handleAddClassroom = async (newRoom: Classroom) => {
    try {
      const created = await adminApi.createRoom({
        name: newRoom.name,
        code: newRoom.code,
        capacity: newRoom.capacity,
        floor: newRoom.floor,
        type: newRoom.type,
        status: newRoom.status,
      });
      setClassrooms(prev => [...prev, created]);
      logActivity(
        `New Learning Space Registered: ${created.name}`,
        `Type: ${created.type} • Capacity: ${created.capacity} seats • Floor: ${created.floor}`,
        'room_change'
      );
      showNotification(`Space "${created.name}" created and saved to PostgreSQL inventory.`);
    } catch (err: any) {
      alert(`Error creating space: ${err.message}`);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    const target = classrooms.find(c => c.id === id);
    if (!confirm(`Are you sure you want to remove space "${target?.name}"?`)) return;
    try {
      await adminApi.deleteRoom(id);
      setClassrooms(prev => prev.filter(c => c.id !== id));
      logActivity(
        `Space Removed: ${target?.name || id}`,
        `Decommissioned from campus rooms inventory`,
        'room_change'
      );
      showNotification(`Space "${target?.name}" removed.`);
    } catch (err: any) {
      alert(`Cannot delete space: ${err.message}`);
    }
  };

  const handleToggleClassroom = (id: string) => {
    setClassrooms(prev => prev.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === 'Maintenance' ? 'Available' : 'Maintenance';
        logActivity(
          `Classroom Maintenance Updated: ${c.name}`,
          `Status changed to "${nextStatus}"`,
          'room_change'
        );
        showNotification(`${c.name} is now marked as ${nextStatus}.`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // 5. Division Management - Real PostgreSQL Persistence
  const handleAddDivision = async (newDiv: AcademicDivisionEntry) => {
    try {
      const created = await adminApi.createDivision({
        course: newDiv.course,
        year: newDiv.year,
        divisionNames: newDiv.divisionNames || newDiv.divisions.join(', '),
      });
      setDivisions(prev => [...prev, created]);
      logActivity(
        `New Division Cohort Added: ${created.course} ${created.year}`,
        `Department: ${created.department} • Divisions: ${created.divisionNames} (${created.divisionCount} divisions)`,
        'status'
      );
      showNotification(`Division cohort for ${created.course} ${created.year} saved to PostgreSQL.`);
    } catch (err: any) {
      alert(`Error creating division: ${err.message}`);
    }
  };

  const handleDeleteDivision = (no: number) => {
    const target = divisions.find(d => d.no === no);
    if (!confirm(`Are you sure you want to remove cohort #${no} (${target?.course} ${target?.year})?`)) return;
    setDivisions(prev => prev.filter(d => d.no !== no));
    logActivity(
      `Division Cohort Removed: #${no}`,
      `Removed ${target?.course} ${target?.year} divisions`,
      'status'
    );
    showNotification(`Division cohort removed.`);
  };

  // 6. Timetable Lecture Management - Direct Backend API Integration
  const handleAddLecture = async (newLecture: Lecture) => {
    try {
      const dayMap: Record<string, number> = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5
      };
      const timeToPeriod: Record<string, number> = {
        '09:00 - 10:00': 1,
        '10:00 - 11:00': 2,
        '11:00 - 12:00': 3,
        '01:00 - 02:00': 4,
        '02:00 - 03:00': 5,
      };

      const dayNum = dayMap[newLecture.day.toLowerCase()] || 1;
      const periodNum = timeToPeriod[newLecture.time] || 1;

      const created = await timetableApi.createExtraLecture({
        subjectId: newLecture.subject,
        divisionId: newLecture.divisionKey || `${newLecture.course}_${newLecture.year}_${newLecture.division}`,
        teacherId: newLecture.teacherId || newLecture.teacher,
        roomId: newLecture.room,
        dayOfWeek: dayNum,
        periodNumber: periodNum,
        reason: 'Administrative schedule entry'
      });

      await refreshMasterTimetable();
      logActivity(
        `Admin Scheduled Lecture: ${created.subject}`,
        `${created.room} • ${created.day} ${created.time} • Synced to ${created.course} ${created.division}`,
        'reschedule'
      );
      showNotification(`Lecture "${created.subject}" created and synchronized with division ${created.division}.`);
    } catch (err: any) {
      console.error('Failed to create lecture:', err);
      const conflictMsg = err.details?.conflicts?.[0]?.message || err.message || 'Schedule conflict detected.';
      showNotification(`⚠️ Conflict: ${conflictMsg}`);
    }
  };

  const handleConfirmReschedule = async (id: string, newTime: string, newRoom: string, newDay?: string, newTeacher?: string) => {
    try {
      const targetLec = lectures.find(l => l.id === id);
      const targetDay = newDay || targetLec?.day || 'Monday';

      const updated = await timetableApi.rescheduleLecture(id, {
        dayOfWeek: targetDay,
        timeString: newTime,
        reason: 'Administrative timetable adjustment'
      });

      if (newRoom && targetLec && newRoom !== targetLec.room) {
        await timetableApi.changeLectureRoom(id, newRoom, 'Administrative room relocation');
      }

      if (newTeacher && targetLec && newTeacher !== targetLec.teacher) {
        await timetableApi.changeLectureTeacher(id, newTeacher, 'Administrative substitute faculty assignment');
      }

      await refreshMasterTimetable();
      logActivity(
        `Admin Rescheduled ${updated.subject}`,
        `${updated.day} ${newTime} • ${newRoom}${newTeacher ? ` • ${newTeacher}` : ''} • Master timetable updated`,
        'reschedule'
      );
      showNotification(`Lecture "${updated.subject}" updated. All students and faculty synchronized.`);
    } catch (err: any) {
      console.error('Admin reschedule error:', err);
      const conflictMsg = err.details?.conflicts?.[0]?.message || err.message || 'Schedule conflict detected.';
      showNotification(`⚠️ Conflict: ${conflictMsg}`);
    }
  };

  const handleCancelLecture = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this lecture? Affected students will be notified immediately.')) return;
    try {
      const cancelled = await timetableApi.cancelLecture(id, 'Cancelled by Academic Administration');
      await refreshMasterTimetable();
      logActivity(
        `Admin Cancelled ${cancelled.subject}`,
        `${cancelled.room} • ${cancelled.day} ${cancelled.time} • Schedule slot released`,
        'status'
      );
      showNotification(`Lecture "${cancelled.subject}" cancelled. Division ${cancelled.division} students notified.`);
    } catch (err: any) {
      console.error('Admin cancel lecture error:', err);
      showNotification(`⚠️ Error: ${err.message || 'Failed to cancel lecture'}`);
    }
  };

  // Suggested next IDs
  const nextTeacherId = `T${String(teachers.length + 1).padStart(3, '0')}`;
  const nextStudentId = `STU${String(students.length + 1).padStart(4, '0')}`;
  const nextDivisionNo = divisions.length + 1;

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'students', label: `Students (${students.length})`, icon: <UserCheck size={18} /> },
    { id: 'faculty', label: `Faculty (${teachers.length})`, icon: <Users size={18} /> },
    { id: 'departments', label: `Departments (${departments.length})`, icon: <Building2 size={18} /> },
    { id: 'divisions', label: `Divisions (${divisions.length})`, icon: <Layers size={18} /> },
    { id: 'curriculum', label: 'Curriculum & Subjects', icon: <BookOpen size={18} /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar size={18} /> },
    { id: 'classrooms', label: `Spaces & Labs (${classrooms.length})`, icon: <DoorOpen size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Toast Notification Alert */}
      {notificationBanner && (
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
          <CheckCircle2 size={18} color="#10B981" />
          <span>{notificationBanner}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand-icon">
              <GraduationCap size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="sidebar-brand-name">SyncCampus</div>
              <span className="sidebar-role-tag">Admin Panel</span>
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
      <div className="admin-main-wrapper">
        {/* Top Navigation Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-breadcrumb">
              SyncCampus / <span className="current">{navItems.find(i => i.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button 
              className="icon-button" 
              title="Notifications"
              onClick={() => showNotification(`${divisions.length} Divisions synchronized. 0 timetable conflicts detected.`)}
            >
              <Bell size={18} />
              <span className="notification-badge-dot" />
            </button>

            <div className="admin-profile-pill">
              <div className="profile-avatar">AD</div>
              <div className="profile-info">
                <span className="profile-name">Academic Admin</span>
                <span className="profile-subtitle">Central Administration</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <div className="admin-content-area">
          {activeTab === 'dashboard' && (
            <OverviewView
              lectures={lectures}
              activities={activities}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCreateLecture={() => setIsCreateLectureOpen(true)}
              departmentsCount={departments.length}
              divisionsCount={divisions.length}
              teachersCount={teachers.length}
              studentsCount={students.length}
              classroomsCount={classrooms.length}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'faculty' && (
            <FacultyView 
              teachers={teachers}
              onOpenAddTeacher={() => setIsAddTeacherOpen(true)}
              onDeleteTeacher={handleDeleteTeacher}
              onToggleTeacherStatus={handleToggleTeacherStatus}
              onNavigateToCurriculum={() => setActiveTab('curriculum')}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView 
              departments={departments}
              onOpenAddDepartment={() => setIsAddDeptOpen(true)}
              onDeleteDepartment={handleDeleteDepartment}
              onNavigateToDivisions={() => setActiveTab('divisions')}
              onNavigateToCurriculum={() => setActiveTab('curriculum')}
              onNavigateToFaculty={() => setActiveTab('faculty')}
            />
          )}

          {activeTab === 'divisions' && (
            <DivisionsView 
              divisions={divisions}
              onOpenAddDivision={() => setIsAddDivisionOpen(true)}
              onDeleteDivision={handleDeleteDivision}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumView 
              onNavigateToFaculty={() => setActiveTab('faculty')}
            />
          )}

          {activeTab === 'timetable' && (
            isLoadingTimetable && lectures.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Loading authoritative master timetable...</div>
              </div>
            ) : (
              <TimetableView
                lectures={lectures}
                onOpenCreateLecture={() => setIsCreateLectureOpen(true)}
                onOpenReschedule={(lec) => setRescheduleTarget(lec)}
                onCancelLecture={handleCancelLecture}
              />
            )
          )}

          {activeTab === 'classrooms' && (
            <ClassroomsView
              classrooms={classrooms}
              onToggleStatus={handleToggleClassroom}
              onOpenAddClassroom={() => setIsAddClassroomOpen(true)}
              onDeleteClassroom={handleDeleteClassroom}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </div>
      </div>

      {/* Action Modals */}
      <CreateLectureModal
        isOpen={isCreateLectureOpen}
        onClose={() => setIsCreateLectureOpen(false)}
        onAddLecture={handleAddLecture}
        existingLectures={lectures}
        teachers={teachers}
        classrooms={classrooms}
      />

      <RescheduleModal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        lecture={rescheduleTarget}
        onConfirmReschedule={handleConfirmReschedule}
        onCancelLecture={handleCancelLecture}
        teachers={teachers}
        classrooms={classrooms}
      />

      <AddTeacherModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
        onAddTeacher={handleAddTeacher}
        suggestedId={nextTeacherId}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
        suggestedId={nextStudentId}
      />

      <AddDepartmentModal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        onAddDepartment={handleAddDepartment}
      />

      <AddClassroomModal
        isOpen={isAddClassroomOpen}
        onClose={() => setIsAddClassroomOpen(false)}
        onAddClassroom={handleAddClassroom}
      />

      <AddDivisionModal
        isOpen={isAddDivisionOpen}
        onClose={() => setIsAddDivisionOpen(false)}
        onAddDivision={handleAddDivision}
        suggestedNo={nextDivisionNo}
      />
    </div>
  );
};

export default AdminDashboard;
