import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import type { Role } from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import { authApi, mapServerRoleToAppRole } from './services/authApi';
import type { AuthUser } from './services/authApi';
import { initRealtime, disconnectRealtime } from './services/realtime';

interface UserSession {
  role: Role;
  email: string;
  user?: AuthUser;
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Restore authenticated session on page refresh (F5) via backend refresh token
  useEffect(() => {
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
    setSession({ role, email, user });
  };

  const handleLogout = async () => {
    try {
      disconnectRealtime();
      await authApi.logout();
    } catch {
      // Ignored
    } finally {
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

      {/* Superuser Portal Switcher for Shivam Shirodkar */}
      {session && session.email.toLowerCase() === 'shirodkarshivam068@gmail.com' && (
        <aside
          aria-label="Superuser Portal Switcher"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 24px rgba(59, 130, 246, 0.35)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#38BDF8',
              padding: '0 8px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>👑</span>
            <span>Shivam Access:</span>
          </span>
          <button
            type="button"
            onClick={() => setSession(prev => (prev ? { ...prev, role: 'student' } : null))}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session.role === 'student'
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session.role === 'student' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session.role === 'student'
                  ? '0 0 12px rgba(16, 185, 129, 0.5)'
                  : 'none',
            }}
          >
            🎓 Student Portal
          </button>
          <button
            type="button"
            onClick={() => setSession(prev => (prev ? { ...prev, role: 'teacher' } : null))}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session.role === 'teacher'
                  ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session.role === 'teacher' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session.role === 'teacher'
                  ? '0 0 12px rgba(59, 130, 246, 0.5)'
                  : 'none',
            }}
          >
            👨‍🏫 Faculty Portal
          </button>
          <button
            type="button"
            onClick={() => setSession(prev => (prev ? { ...prev, role: 'admin' } : null))}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background:
                session.role === 'admin'
                  ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                  : 'rgba(255, 255, 255, 0.08)',
              color: session.role === 'admin' ? '#FFFFFF' : '#CBD5E1',
              boxShadow:
                session.role === 'admin'
                  ? '0 0 12px rgba(139, 92, 246, 0.5)'
                  : 'none',
            }}
          >
            🛡️ Admin Portal
          </button>
        </aside>
      )}
    </div>
  );
}

export default App;
