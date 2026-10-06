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
    if (!isAuthEnabled) {
      const savedRole = (sessionStorage.getItem('syncampus_test_role') as Role) || 'student';
      setDevRole(savedRole);
      const email =
        savedRole === 'admin'
          ? 'admin@campus.edu'
          : savedRole === 'teacher'
          ? 'rahul.patil.t001@campus.edu'
          : 'stu0001@sonopantcollege.edu.in';
      return { role: savedRole, email };
    }
    return null;
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(isAuthEnabled);

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
          setSession({
            role: appRole,
            email: user.email,
            user,
          });
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
  }, [isAuthEnabled]);

  // Manage Real-time Socket.IO connection lifecycle based on authentication state
  useEffect(() => {
    if (session) {
      initRealtime();
    } else {
      disconnectRealtime();
    }
  }, [session]);

  const handleSwitchRole = (newRole: Role) => {
    setDevRole(newRole);
    sessionStorage.setItem('syncampus_test_role', newRole);
    const email =
      newRole === 'admin'
        ? 'admin@campus.edu'
        : newRole === 'teacher'
        ? 'rahul.patil.t001@campus.edu'
        : 'stu0001@sonopantcollege.edu.in';
    setSession({ role: newRole, email });
  };

  const handleLoginSuccess = (role: Role, email: string, user?: AuthUser) => {
    setSession({ role, email, user });
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
      if (isAuthEnabled) {
        setSession(null);
      } else {
        handleSwitchRole('student');
      }
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

      {/* Development Testing Mode Floating Role Switcher */}
      {!isAuthEnabled && (
        <aside
          aria-label="Development Testing Role Switcher"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '9999px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 16px 36px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.25)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#38BDF8',
              padding: '0 6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '13px' }}>🧪</span>
            <span>Test Mode:</span>
          </span>

          <button
            type="button"
            id="test-role-student"
            onClick={() => handleSwitchRole('student')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session?.role === 'student'
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session?.role === 'student' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session?.role === 'student'
                  ? '0 0 14px rgba(16, 185, 129, 0.5)'
                  : 'none',
            }}
          >
            🎓 Student Dashboard
          </button>

          <button
            type="button"
            id="test-role-teacher"
            onClick={() => handleSwitchRole('teacher')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session?.role === 'teacher'
                  ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session?.role === 'teacher' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session?.role === 'teacher'
                  ? '0 0 14px rgba(59, 130, 246, 0.5)'
                  : 'none',
            }}
          >
            👨‍🏫 Faculty Dashboard
          </button>

          <button
            type="button"
            id="test-role-admin"
            onClick={() => handleSwitchRole('admin')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session?.role === 'admin'
                  ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session?.role === 'admin' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session?.role === 'admin'
                  ? '0 0 14px rgba(139, 92, 246, 0.5)'
                  : 'none',
            }}
          >
            🛡️ Admin Dashboard
          </button>
        </aside>
      )}
    </div>
  );
}

export default App;
