import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  GraduationCap, 
  Presentation, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  X, 
  UserCheck, 
  Building, 
  BookOpen, 
  Users,
  Lock,
  AlertCircle 
} from 'lucide-react';
import './LoginPage.css';
import { findTeacherByQuery, TEACHERS_DATA } from '../data/teachersData';
import type { TeacherProfile } from '../data/teachersData';
import { findStudentByQuery, STUDENTS_DATA } from '../data/studentsData';
import type { Student } from '../data/studentsData';
import { authApi, mapServerRoleToAppRole } from '../services/authApi';
import type { AuthUser } from '../services/authApi';

export type Role = 'student' | 'teacher' | 'admin';
type Step = 'roles' | 'email' | 'otp' | 'success';

interface RoleConfig {
  id: Role;
  name: string;
  loginTitle: string;
  badgeLabel: string;
  colorClass: string;
  emailPlaceholder: string;
  icon: React.ReactNode;
}

const ROLES: Record<Role, RoleConfig> = {
  student: {
    id: 'student',
    name: 'Student',
    loginTitle: 'Student Login',
    badgeLabel: 'Student Portal',
    colorClass: 'student',
    emailPlaceholder: 'e.g. stu0001@sonopantcollege.edu.in, stu0001@gmail.com, or Yash Pawar',
    icon: <GraduationCap size={32} strokeWidth={1.8} />,
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    loginTitle: 'Teacher Login',
    badgeLabel: 'Faculty Portal',
    colorClass: 'teacher',
    emailPlaceholder: 'e.g. rahul.patil.t001@campus.edu or Neha Kulkarni',
    icon: <Presentation size={32} strokeWidth={1.8} />,
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    loginTitle: 'Admin Login',
    badgeLabel: 'Campus Admin',
    colorClass: 'admin',
    emailPlaceholder: 'admin@campus.edu',
    icon: <ShieldCheck size={32} strokeWidth={1.8} />,
  },
};

interface LoginPageProps {
  onLoginSuccess?: (role: Role, email: string, user?: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [step, setStep] = useState<Step>('roles');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Teacher-specific state
  const [matchedTeacher, setMatchedTeacher] = useState<TeacherProfile | null>(null);
  const [showFacultyModal, setShowFacultyModal] = useState<boolean>(false);
  const [facultySearch, setFacultySearch] = useState<string>('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState<string>('ALL');

  // Student-specific state
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentDeptFilter, setStudentDeptFilter] = useState<string>('ALL');

  // Popular quick-pick teachers for fast access
  const QUICK_TEACHERS = [
    { name: 'Prof. Shivam Shirodkar', id: 'T-SHIVAM', email: 'shirodkarshivam068@gmail.com', dept: 'Science & Tech' },
    { name: 'Prof. Rahul Patil', id: 'T001', email: 'rahul.patil.t001@campus.edu', dept: 'Science & Tech' },
    { name: 'Prof. Neha Kulkarni', id: 'T004', email: 'neha.kulkarni.t004@campus.edu', dept: 'Science & Tech' },
    { name: 'Prof. Sneha Joshi', id: 'T002', email: 'sneha.joshi.t002@campus.edu', dept: 'Science & Tech' },
    { name: 'Prof. Amit Shah', id: 'T003', email: 'amit.shah.t003@campus.edu', dept: 'Science & Tech' },
    { name: 'Prof. Meera Kulkarni', id: 'T031', email: 'meera.kulkarni.t031@campus.edu', dept: 'Commerce' },
    { name: 'Prof. Arjun Mehta', id: 'T056', email: 'arjun.mehta.t056@campus.edu', dept: 'Management' },
    { name: 'Prof. Kavita Desai', id: 'T066', email: 'kavita.desai.t066@campus.edu', dept: 'Arts' },
  ];

  // Popular quick-pick students for fast access
  const QUICK_STUDENTS = [
    { name: 'Shivam Shirodkar', id: 'STU-SHIVAM', email: 'shirodkarshivam068@gmail.com', cohort: 'BSc IT FY Div A' },
    { name: 'Yash Pawar', id: 'STU0001', email: 'stu0001@sonopantcollege.edu.in', cohort: 'BSc IT FY Div A' },
    { name: 'Vedant Patil', id: 'STU0002', email: 'stu0002@sonopantcollege.edu.in', cohort: 'BSc IT FY Div A' },
    { name: 'Riya Chavan', id: 'STU0003', email: 'stu0003@sonopantcollege.edu.in', cohort: 'BSc IT FY Div A' },
    { name: 'Sakshi Verma', id: 'STU2700', email: 'stu2700@sonopantcollege.edu.in', cohort: 'BBA TY Div B' },
    { name: 'Aarav Mehta', id: 'STU0313', email: 'stu0313@sonopantcollege.edu.in', cohort: 'BSc CS FY Div A' },
    { name: 'Meera Sharma', id: 'STU0625', email: 'stu0625@sonopantcollege.edu.in', cohort: 'B.Com FY Div A' },
  ];

  // Auto-detect faculty or student as user types
  useEffect(() => {
    if (!email.trim()) {
      setMatchedTeacher(null);
      setMatchedStudent(null);
      return;
    }

    if (selectedRole === 'teacher') {
      const found = findTeacherByQuery(email.trim());
      setMatchedTeacher(found || null);
      setMatchedStudent(null);
    } else if (selectedRole === 'student') {
      const found = findStudentByQuery(email.trim());
      setMatchedStudent(found || null);
      setMatchedTeacher(null);
    } else {
      setMatchedTeacher(null);
      setMatchedStudent(null);
    }
  }, [email, selectedRole]);

  // Live autocomplete suggestions for Teacher
  const teacherSuggestions = useMemo(() => {
    if (selectedRole !== 'teacher' || !email.trim()) return [];
    const q = email.trim().toLowerCase();
    if (matchedTeacher && matchedTeacher.email.toLowerCase() === q) return [];

    return TEACHERS_DATA.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.subjects.some(s => s.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [email, selectedRole, matchedTeacher]);

  // Live autocomplete suggestions for Student
  const studentSuggestions = useMemo(() => {
    if (selectedRole !== 'student' || !email.trim()) return [];
    const q = email.trim().toLowerCase();
    if (matchedStudent && matchedStudent.email.toLowerCase() === q) return [];

    return STUDENTS_DATA.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.classroom.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [email, selectedRole, matchedStudent]);

  // Filtered teachers for the 135 Faculty Directory modal
  const filteredModalTeachers = useMemo(() => {
    let list = TEACHERS_DATA;
    if (facultyDeptFilter !== 'ALL') {
      list = list.filter(t => t.departmentCode === facultyDeptFilter);
    }
    if (facultySearch.trim()) {
      const q = facultySearch.trim().toLowerCase();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.subjects.some(s => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [facultyDeptFilter, facultySearch]);

  // Filtered students for the 2,700 Student Directory modal
  const filteredModalStudents = useMemo(() => {
    let list = STUDENTS_DATA;
    if (studentDeptFilter !== 'ALL') {
      list = list.filter(s => {
        if (studentDeptFilter === 'SCI_TECH') return s.department === 'Science & Technology';
        if (studentDeptFilter === 'COMMERCE') return s.department === 'Commerce';
        if (studentDeptFilter === 'MGMT') return s.department === 'Management';
        if (studentDeptFilter === 'ARTS') return s.department === 'Arts';
        return true;
      });
    }
    if (studentSearch.trim()) {
      const q = studentSearch.trim().toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.classroom.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 50); // display top 50 matches for instantaneous rendering
  }, [studentDeptFilter, studentSearch]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setLoginError(null);
    setOtpInfoMessage(null);
    setStep('email');
    if (role === 'teacher' && !email) {
      setEmail('rahul.patil.t001@campus.edu');
    } else if (role === 'student' && !email) {
      setEmail('shirodkarshivam068@gmail.com');
    } else if (role === 'admin' && !email) {
      setEmail('admin@campus.edu');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setOtpInfoMessage(null);
    let targetEmail = (customEmail !== undefined ? customEmail : email).trim();

    if (selectedRole === 'teacher') {
      const detected = findTeacherByQuery(targetEmail);
      if (detected) {
        targetEmail = detected.email;
        setMatchedTeacher(detected);
      } else if (!targetEmail) {
        targetEmail = 'rahul.patil.t001@campus.edu';
        setMatchedTeacher(TEACHERS_DATA[0]);
      }
    } else if (selectedRole === 'student') {
      const detected = findStudentByQuery(targetEmail);
      if (detected) {
        targetEmail = detected.email;
        setMatchedStudent(detected);
      } else if (!targetEmail) {
        targetEmail = 'shirodkarshivam068@gmail.com';
        setMatchedStudent(STUDENTS_DATA[0]);
      }
    } else if (!targetEmail) {
      targetEmail = ROLES[selectedRole].emailPlaceholder;
    }

    setEmail(targetEmail);
    setIsSendingOtp(true);

    try {
      const result = await authApi.requestOtp(targetEmail, selectedRole);
      setOtp(['', '', '', '', '', '']);
      setOtpInfoMessage(result.message);
      if (result.devCode) {
        console.log(`[SyncCampus Auth] Verification code for ${result.email || targetEmail}: [${result.devCode}]`);
      }
      setStep('otp');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to dispatch verification code. Please check your credentials.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setLoginError(null);
    setOtpInfoMessage(null);
    setIsSendingOtp(true);

    try {
      const result = await authApi.requestOtp(email.trim(), selectedRole);
      setOtp(['', '', '', '', '', '']);
      setOtpInfoMessage(result.message);
      if (result.devCode) {
        console.log(`[SyncCampus Auth] Re-sent verification code for ${result.email || email}: [${result.devCode}]`);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Enable paste of 6-digit code into any box
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6);
      if (cleanDigits.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = cleanDigits[i] || '';
        }
        setOtp(newOtp);
        const focusIdx = Math.min(cleanDigits.length, 5);
        otpInputRefs.current[focusIdx]?.focus();
        return;
      }
    }

    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('').trim();
    if (enteredCode.length !== 6) {
      setLoginError('Please enter all 6 digits of the verification code.');
      return;
    }

    let finalEmail = email.trim() || ROLES[selectedRole].emailPlaceholder;

    if (selectedRole === 'teacher') {
      const detected = findTeacherByQuery(finalEmail);
      if (detected) {
        finalEmail = detected.email;
      }
    } else if (selectedRole === 'student') {
      const detected = findStudentByQuery(finalEmail);
      if (detected) {
        finalEmail = detected.email;
      }
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // Connect to real backend OTP verification endpoint
      const user = await authApi.verifyOtp(finalEmail, enteredCode, selectedRole);
      const appRole = mapServerRoleToAppRole(user.role);

      if (onLoginSuccess) {
        onLoginSuccess(appRole, user.email || finalEmail, user);
      } else {
        setStep('success');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectFacultyFromModal = async (teacher: TeacherProfile) => {
    setEmail(teacher.email);
    setMatchedTeacher(teacher);
    setShowFacultyModal(false);
    await handleSendOtp(undefined, teacher.email);
  };

  const handleSelectStudentFromModal = async (student: Student) => {
    setEmail(student.email);
    setMatchedStudent(student);
    setShowStudentModal(false);
    await handleSendOtp(undefined, student.email);
  };

  const handleBackToRoles = () => {
    setLoginError(null);
    setOtpInfoMessage(null);
    setStep('roles');
    setOtp(['', '', '', '', '', '']);
  };

  const handleBackToEmail = () => {
    setLoginError(null);
    setOtpInfoMessage(null);
    setStep('email');
    setOtp(['', '', '', '', '', '']);
  };

  const activeRoleConfig = ROLES[selectedRole];

  return (
    <div className="login-container">
      {/* Top Header */}
      <header className="login-header">
        <div className="brand-wrapper">
          <div className="brand-logo-icon">
            <GraduationCap size={22} strokeWidth={2.2} />
          </div>
          <h1 className="brand-title">SyncCampus</h1>
        </div>
        <p className="brand-tagline">Everything about your campus, in sync.</p>
      </header>

      {/* Main Content */}
      <main className="login-main">
        {/* STEP 1: Role Selection Cards */}
        {step === 'roles' && (
          <div className="role-grid">
            {/* Student Card */}
            <div 
              className="role-card student"
              onClick={() => handleSelectRole('student')}
              role="button"
              tabIndex={0}
            >
              <div className="card-content">
                <div className="role-icon-box student">
                  <GraduationCap size={32} strokeWidth={1.8} />
                </div>
                <h2 className="role-title">Student Login</h2>
              </div>
              <button 
                className="role-button student"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('student');
                }}
              >
                <span>Continue</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>
            </div>

            {/* Teacher Card */}
            <div 
              className="role-card teacher"
              onClick={() => handleSelectRole('teacher')}
              role="button"
              tabIndex={0}
            >
              <div className="card-content">
                <div className="role-icon-box teacher">
                  <Presentation size={32} strokeWidth={1.8} />
                </div>
                <h2 className="role-title">Teacher Login</h2>
              </div>
              <button 
                className="role-button teacher"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('teacher');
                }}
              >
                <span>Continue</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>
            </div>

            {/* Admin Card */}
            <div 
              className="role-card admin"
              onClick={() => handleSelectRole('admin')}
              role="button"
              tabIndex={0}
            >
              <div className="card-content">
                <div className="role-icon-box admin">
                  <ShieldCheck size={32} strokeWidth={1.8} />
                </div>
                <h2 className="role-title">Admin Login</h2>
              </div>
              <button 
                className="role-button admin"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('admin');
                }}
              >
                <span>Continue</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Email Entry */}
        {step === 'email' && (
          <div className={`auth-card ${activeRoleConfig.colorClass}`}>
            <button className="back-nav-btn" onClick={handleBackToRoles}>
              <ArrowLeft size={16} />
              <span>Back to roles</span>
            </button>

            <div className="form-header">
              <span className={`role-badge ${activeRoleConfig.colorClass}`}>
                {activeRoleConfig.badgeLabel}
              </span>
              <h2 className="form-title">
                {selectedRole === 'teacher' 
                  ? 'Faculty Authentication' 
                  : selectedRole === 'student' 
                    ? 'Student Portal Login' 
                    : 'Admin Sign In'}
              </h2>
              <p className="form-subtext">
                {selectedRole === 'teacher' 
                  ? 'Enter your faculty email, employee ID (e.g. T001), or full name.'
                  : selectedRole === 'student'
                    ? 'Enter your college email, Gmail address, Student ID (e.g. STU0001), or full name.'
                    : 'Enter your campus administrator email address.'}
              </p>
            </div>

            <form onSubmit={handleSendOtp}>
              <div className="input-group" style={{ position: 'relative' }}>
                <label className="input-label" htmlFor="email-input">
                  {selectedRole === 'teacher' 
                    ? 'Faculty Email / Name / ID' 
                    : selectedRole === 'student'
                      ? 'Student Email / Gmail / ID / Name'
                      : 'Admin Email'}
                </label>
                <div className="input-field-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="email-input"
                    type="text"
                    className="text-input"
                    placeholder={activeRoleConfig.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                  {email && (
                    <button 
                      type="button" 
                      onClick={() => { 
                        setEmail(''); 
                        setMatchedTeacher(null); 
                        setMatchedStudent(null); 
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown for Teacher Login */}
                {selectedRole === 'teacher' && teacherSuggestions.length > 0 && (
                  <div className="teacher-suggestions-list">
                    {teacherSuggestions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="teacher-suggestion-item"
                        onClick={() => {
                          setEmail(t.email);
                          setMatchedTeacher(t);
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#CCFBF1',
                          color: '#0F766E',
                          fontWeight: 700,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="teacher-suggestion-name">{t.title} ({t.id})</div>
                          <div className="teacher-suggestion-sub">{t.department} &bull; {t.subjects.join(', ')}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions Dropdown for Student Login */}
                {selectedRole === 'student' && studentSuggestions.length > 0 && (
                  <div className="teacher-suggestions-list">
                    {studentSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="teacher-suggestion-item"
                        onClick={() => {
                          setEmail(s.email);
                          setMatchedStudent(s);
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#DBEAFE',
                          color: '#1D4ED8',
                          fontWeight: 700,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="teacher-suggestion-name">{s.name} ({s.id})</div>
                          <div className="teacher-suggestion-sub">{s.course} {s.year} (Div {s.division}) &bull; {s.classroom}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Teacher Preview Badge */}
                {selectedRole === 'teacher' && matchedTeacher && (
                  <div className="matched-teacher-banner">
                    <div className="matched-teacher-avatar">
                      <UserCheck size={18} />
                    </div>
                    <div className="matched-teacher-info">
                      <div className="matched-teacher-name">
                        {matchedTeacher.title} ({matchedTeacher.id})
                      </div>
                      <div className="matched-teacher-detail">
                        {matchedTeacher.department} &bull; {matchedTeacher.subjects.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Matched Student Preview Badge */}
                {selectedRole === 'student' && matchedStudent && (
                  <div className="matched-teacher-banner" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                    <div className="matched-teacher-avatar" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                      <UserCheck size={18} />
                    </div>
                    <div className="matched-teacher-info">
                      <div className="matched-teacher-name" style={{ color: '#1E40AF' }}>
                        {matchedStudent.name} ({matchedStudent.id})
                      </div>
                      <div className="matched-teacher-detail" style={{ color: '#2563EB' }}>
                        {matchedStudent.course} {matchedStudent.year} (Div {matchedStudent.division}) &bull; Classroom: {matchedStudent.classroom} (Batch {matchedStudent.batch})
                      </div>
                    </div>
                  </div>
                )}
                {/* Account Password Field */}
                <div className="input-group" style={{ marginTop: '16px' }}>
                  <label className="input-label" htmlFor="password-input">
                    Account Password
                  </label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="password-input"
                      type="password"
                      className="text-input"
                      placeholder="Default: password123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {loginError && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{loginError}</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={`role-button ${activeRoleConfig.colorClass}`}
                style={{ marginTop: '16px' }}
              >
                <span>Send OTP &amp; Proceed</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>

              {/* Teacher Quick Select Chips */}
              {selectedRole === 'teacher' && (
                <div className="faculty-quick-section">
                  <div className="faculty-quick-header">
                    <span className="faculty-quick-title">Quick Select Faculty</span>
                    <button 
                      type="button" 
                      className="faculty-browse-all-btn"
                      onClick={() => setShowFacultyModal(true)}
                    >
                      Browse All {TEACHERS_DATA.length} &rarr;
                    </button>
                  </div>
                  <div className="faculty-chip-cloud">
                    {QUICK_TEACHERS.map((qt) => {
                      const isActive = email.toLowerCase() === qt.email.toLowerCase() || 
                                       matchedTeacher?.id === qt.id;
                      return (
                        <button
                          key={qt.id}
                          type="button"
                          className={`faculty-pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setEmail(qt.email);
                            const t = findTeacherByQuery(qt.email);
                            if (t) setMatchedTeacher(t);
                          }}
                        >
                          <span>{qt.name} ({qt.id})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student Quick Select Chips */}
              {selectedRole === 'student' && (
                <div className="faculty-quick-section">
                  <div className="faculty-quick-header">
                    <span className="faculty-quick-title">Quick Select Student</span>
                    <button 
                      type="button" 
                      className="faculty-browse-all-btn"
                      style={{ color: '#2563EB' }}
                      onClick={() => setShowStudentModal(true)}
                    >
                      Browse All 2,700 Students &rarr;
                    </button>
                  </div>
                  <div className="faculty-chip-cloud">
                    {QUICK_STUDENTS.map((qs) => {
                      const isActive = email.toLowerCase() === qs.email.toLowerCase() || 
                                       matchedStudent?.id === qs.id;
                      return (
                        <button
                          key={qs.id}
                          type="button"
                          className={`faculty-pill-btn ${isActive ? 'active' : ''}`}
                          style={{
                            background: isActive ? '#2563EB' : '#EFF6FF',
                            borderColor: isActive ? '#1D4ED8' : '#DBEAFE',
                            color: isActive ? '#FFFFFF' : '#1D4ED8'
                          }}
                          onClick={() => {
                            setEmail(qs.email);
                            const s = findStudentByQuery(qs.email);
                            if (s) setMatchedStudent(s);
                          }}
                        >
                          <span>{qs.name} ({qs.id})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* STEP 3: OTP Verification */}
        {step === 'otp' && (
          <div className={`auth-card ${activeRoleConfig.colorClass}`}>
            <button className="back-nav-btn" onClick={handleBackToEmail}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="form-header">
              <span className={`role-badge ${activeRoleConfig.colorClass}`}>
                {activeRoleConfig.badgeLabel}
              </span>
              <h2 className="form-title">Enter Verification Code</h2>
              <p className="form-subtext">
                {selectedRole === 'teacher' && matchedTeacher ? (
                  <span>
                    Logging in as <strong>{matchedTeacher.title}</strong> ({matchedTeacher.id} &bull; {matchedTeacher.department}).
                  </span>
                ) : selectedRole === 'student' && matchedStudent ? (
                  <span>
                    Logging in as <strong>{matchedStudent.name}</strong> ({matchedStudent.id} &bull; {matchedStudent.course} {matchedStudent.year} Div {matchedStudent.division} &bull; {matchedStudent.classroom}).
                  </span>
                ) : (
                  <span>
                    Enter the 6-digit code sent to <strong>{email || activeRoleConfig.emailPlaceholder}</strong>
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="otp-inputs-row">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-box"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {otpInfoMessage && !loginError && (
                <div style={{
                  background: selectedRole === 'student' ? '#EFF6FF' : '#F0FDFA',
                  border: `1px solid ${selectedRole === 'student' ? '#DBEAFE' : '#CCFBF1'}`,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: selectedRole === 'student' ? '#1D4ED8' : '#0F766E',
                  textAlign: 'center',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={15} color={selectedRole === 'student' ? '#2563EB' : '#0D9488'} />
                  <span>{otpInfoMessage}</span>
                </div>
              )}

              {loginError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`role-button ${activeRoleConfig.colorClass}`}
                disabled={isLoggingIn || otp.join('').trim().length !== 6}
              >
                <span>{isLoggingIn ? 'Verifying with Backend...' : 'Verify & Enter Dashboard'}</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>

              <div className="form-footer-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="action-link"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Sending new code...' : 'Resend Code'}
                </button>
                <button 
                  type="button" 
                  className="action-link"
                  onClick={handleBackToEmail}
                >
                  Change Email / ID
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Success Fallback */}
        {step === 'success' && (
          <div className={`auth-card ${activeRoleConfig.colorClass}`} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div className={`role-icon-box ${activeRoleConfig.colorClass}`}>
                <CheckCircle2 size={36} />
              </div>
            </div>
            <h2 className="form-title">Verified Successfully</h2>
            <p className="form-subtext" style={{ marginBottom: '24px' }}>
              Authenticated as <strong>{activeRoleConfig.name}</strong>.
            </p>
            <button 
              className={`role-button ${activeRoleConfig.colorClass}`}
              onClick={handleBackToRoles}
            >
              <RefreshCw size={16} />
              <span>Sign Out / Switch Role</span>
            </button>
          </div>
        )}
      </main>

      {/* MODAL: Browse All 135 Faculty Directory */}
      {showFacultyModal && (
        <div className="modal-overlay" onClick={() => setShowFacultyModal(false)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <div className="faculty-directory-header">
              <div>
                <div className="faculty-directory-title">Official Faculty Directory</div>
                <div className="faculty-directory-sub">
                  Select any of the {TEACHERS_DATA.length} college teachers to login dynamically
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowFacultyModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="faculty-modal-search-row">
              <div className="input-field-wrapper" style={{ background: '#FFFFFF' }}>
                <Search size={18} className="input-icon" />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Search by faculty name, subject (e.g. Python, DBMS), or ID..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  autoFocus
                />
                {facultySearch && (
                  <button 
                    type="button" 
                    onClick={() => setFacultySearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="faculty-dept-tabs">
              {[
                { code: 'ALL', label: `All (${TEACHERS_DATA.length})` },
                { code: 'SCI_TECH', label: 'Science & Tech (60)' },
                { code: 'COMMERCE', label: 'Commerce (40)' },
                { code: 'MGMT', label: 'Management (20)' },
                { code: 'ARTS', label: 'Arts (15)' }
              ].map((tab) => (
                <button
                  key={tab.code}
                  className={`faculty-dept-tab ${facultyDeptFilter === tab.code ? 'active' : ''}`}
                  onClick={() => setFacultyDeptFilter(tab.code)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="faculty-modal-list">
              {filteredModalTeachers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No faculty members found matching "{facultySearch}".
                </div>
              ) : (
                filteredModalTeachers.map((t) => (
                  <div key={t.id} className="faculty-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#CCFBF1',
                        color: '#0F766E',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {t.title} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>({t.id})</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t.department} &bull; <span style={{ color: '#0D9488' }}>{t.subjects.join(', ')}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {t.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="faculty-pill-btn"
                      style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                      onClick={() => handleSelectFacultyFromModal(t)}
                    >
                      Login as Faculty &rarr;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Browse All 2,700 Students Directory */}
      {showStudentModal && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <div className="faculty-directory-header">
              <div>
                <div className="faculty-directory-title">Official Student Enrollment Directory</div>
                <div className="faculty-directory-sub">
                  Select any of the 2,700 college students to login dynamically
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowStudentModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="faculty-modal-search-row">
              <div className="input-field-wrapper" style={{ background: '#FFFFFF' }}>
                <Search size={18} className="input-icon" />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Search by student name, ID (e.g. STU0001), course, or room..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  autoFocus
                />
                {studentSearch && (
                  <button 
                    type="button" 
                    onClick={() => setStudentSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="faculty-dept-tabs">
              {[
                { code: 'ALL', label: `All (${STUDENTS_DATA.length})` },
                { code: 'SCI_TECH', label: 'Science & Tech (630)' },
                { code: 'COMMERCE', label: 'Commerce (1,404)' },
                { code: 'ARTS', label: 'Arts (342)' },
                { code: 'MGMT', label: 'Management (324)' }
              ].map((tab) => (
                <button
                  key={tab.code}
                  className={`faculty-dept-tab ${studentDeptFilter === tab.code ? 'active' : ''}`}
                  onClick={() => setStudentDeptFilter(tab.code)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="faculty-modal-list">
              {filteredModalStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No students found matching "{studentSearch}".
                </div>
              ) : (
                filteredModalStudents.map((s) => (
                  <div key={s.id} className="faculty-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#DBEAFE',
                        color: '#1D4ED8',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {s.name} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>({s.id})</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {s.course} {s.year} (Div {s.division}) &bull; <span style={{ color: '#2563EB', fontWeight: 600 }}>{s.classroom}</span> &bull; Batch {s.batch}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {s.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="faculty-pill-btn"
                      style={{ 
                        padding: '8px 14px', 
                        fontSize: '12px', 
                        whiteSpace: 'nowrap',
                        background: '#EFF6FF',
                        borderColor: '#BFDBFE',
                        color: '#1D4ED8'
                      }}
                      onClick={() => handleSelectStudentFromModal(s)}
                    >
                      Login as Student &rarr;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clean Minimal Footer */}
      <footer className="login-footer">
        <span>SyncCampus</span>
        <span className="footer-bullet">•</span>
        <span>Secure Campus Authentication</span>
      </footer>
    </div>
  );
};

export default LoginPage;
