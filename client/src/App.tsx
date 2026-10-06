import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import type { Role } from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import { authApi, mapServerRoleToAppRole, isAuthEnabled, setDevRole } from './services/authApi';
import type { AuthUser } from './services/authApi';
import { initRealtime, disconnectRealtime } from './services/realtime';

interface UserSession {
  role: Role;
  email: string;
  user?: AuthUser;
}

function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('syncampus_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role) {
          setDevRole(parsed.role, parsed.user?.identifier);
          return parsed;
        }
      }
    } catch {
      // Ignored
    }
    return null;
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // Restore authenticated session on page refresh (F5) only in production / auth-enabled mode
  useEffect(() => {
    if (!isAuthEnabled) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    async function checkAuthSession() {
      try {
        const user = await authApi.restoreSession();
        if (user && isMounted) {
          const appRole = mapServerRoleToAppRole(user.role);
          const newSession = {
            role: appRole,
            email: user.email,
            user,
          };
          sessionStorage.setItem('syncampus_user_session', JSON.stringify(newSession));
          setSession(newSession);
        }
      } catch {
        // Unauthenticated or expired session
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manage Real-time Socket.IO connection lifecycle based on authentication state
  useEffect(() => {
    if (session) {
      initRealtime();
    } else {
      disconnectRealtime();
    }
  }, [session]);

  const handleLoginSuccess = (role: Role, email: string, user?: AuthUser) => {
    const newSession = { role, email, user };
    try {
      sessionStorage.setItem('syncampus_user_session', JSON.stringify(newSession));
    } catch {
      // Ignored
    }
    setDevRole(role, user?.identifier);
    setSession(newSession);
  };

  const handleLogout = async () => {
    try {
      disconnectRealtime();
      if (isAuthEnabled) {
        await authApi.logout();
      }
    } catch {
      // Ignored
    } finally {
      try {
        sessionStorage.removeItem('syncampus_user_session');
        sessionStorage.removeItem('syncampus_test_role');
      } catch {
        // Ignored
      }
      setSession(null);
    }
  };

  // Loading state during session restoration to prevent login screen flicker
  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F19',
        color: '#F1F5F9',
        gap: '16px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: '14px', color: '#94A3B8', letterSpacing: '-0.01em' }}>Checking session...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
