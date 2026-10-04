import { useState } from 'react';
import LoginPage from './components/LoginPage';
import type { Role } from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';

interface UserSession {
  role: Role;
  email: string;
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLoginSuccess = (role: Role, email: string) => {
    setSession({ role, email });
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <div className="app-root">
      {!session && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {session?.role === 'admin' && (
        <AdminDashboard adminEmail={session.email} onLogout={handleLogout} />
      )}

      {session?.role === 'teacher' && (
        <TeacherDashboard teacherEmail={session.email} onLogout={handleLogout} />
      )}

      {session?.role === 'student' && (
        <StudentDashboard studentEmail={session.email} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
