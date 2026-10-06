/**
 * SyncCampus Client Authentication API Service
 * Communicates with the real Node.js/Express backend authentication endpoints.
 */

export type ServerRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type AppRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  identifier: string;
  role: ServerRole;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    divisionId?: string;
  } | null;
  teacher?: {
    id: string;
    teacherId: string;
    fullName: string;
    departmentId?: string;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface AuthError {
  error: string;
  message: string;
}

// In-memory token storage (never stored in ordinary persistent storage for maximum security)
let inMemoryAccessToken: string | null = null;
const REFRESH_TOKEN_KEY = 'syncampus_session_rt'; // Dev fallback for session restore

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export const isAuthEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false';

let currentDevRole: AppRole = 'student';
let currentDevIdentifier: string = 'STU0001';

export function setDevRole(role: AppRole, identifier?: string): void {
  currentDevRole = role;
  if (identifier) {
    currentDevIdentifier = identifier;
  } else {
    currentDevIdentifier = role === 'admin' ? 'ADMIN01' : role === 'teacher' ? 'T001' : 'STU0001';
  }
}

export function getDevRole(): AppRole {
  return currentDevRole;
}

export function getDevIdentifier(): string {
  return currentDevIdentifier;
}

// Map backend UPPERCASE role to frontend lowercase Role ('student' | 'teacher' | 'admin')
export function mapServerRoleToAppRole(role: ServerRole): AppRole {
  switch (role) {
    case 'STUDENT':
      return 'student';
    case 'TEACHER':
      return 'teacher';
    case 'ADMIN':
      return 'admin';
    default:
      return 'student';
  }
}

/**
 * Executes an authenticated API request with Bearer token and automatic refresh
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (!isAuthEnabled) {
    headers.set('X-Test-Role', currentDevRole);
    headers.set('X-Test-Identifier', currentDevIdentifier);
  } else if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  // If token expired (401), attempt single session refresh and retry (only in production / auth-enabled mode)
  if (isAuthEnabled && response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
    try {
      const refreshedUser = await authApi.restoreSession();
      if (refreshedUser && inMemoryAccessToken) {
        headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    } catch {
      // Refresh failed
    }
  }

  return response;
}

export const authApi = {
  /**
   * Requests a real 6-digit verification code from backend POST /api/v1/auth/request-otp
   */
  async requestOtp(
    identifier: string,
    requestedRole?: string
  ): Promise<{ success: boolean; message: string; email?: string; devCode?: string }> {
    const res = await fetch('/api/v1/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier: identifier.trim(),
        ...(requestedRole ? { requestedRole: requestedRole.toUpperCase() } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(data.message || 'No account registered with this email or ID.');
      } else if (res.status === 403) {
        throw new Error(data.message || 'Role mismatch: You do not have permission for this portal.');
      } else if (res.status === 429) {
        throw new Error(data.message || 'Too many attempts. Account temporarily locked.');
      } else if (res.status >= 500) {
        throw new Error('Unable to connect to the authentication service. Please try again.');
      }
      throw new Error(data.message || 'Failed to send verification code.');
    }

    return data;
  },

  /**
   * Verifies the 6-digit OTP code against backend POST /api/v1/auth/verify-otp
   */
  async verifyOtp(identifier: string, otp: string, requestedRole?: string): Promise<AuthUser> {
    const res = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier: identifier.trim(),
        otp: otp.trim(),
        ...(requestedRole ? { requestedRole: requestedRole.toUpperCase() } : {}),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error(errorData.message || 'Incorrect verification code. Please check and try again.');
      } else if (res.status === 400) {
        throw new Error(errorData.message || 'Invalid or expired code.');
      } else if (res.status === 429) {
        throw new Error(errorData.message || 'Maximum attempts exceeded. Account temporarily locked.');
      } else if (res.status >= 500) {
        throw new Error('Unable to connect to the authentication service. Please try again.');
      }
      throw new Error(errorData.message || 'Verification failed');
    }

    const data: LoginResponse = await res.json();
    setAccessToken(data.accessToken);

    if (data.refreshToken) {
      try {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      } catch {
        // Ignored
      }
    }

    return data.user;
  },

  /**
   * Authenticates user against backend POST /api/v1/auth/login
   */
  async login(identifier: string, password: string = 'password123', requestedRole?: string): Promise<AuthUser> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier: identifier.trim(),
        password: password.trim() || 'password123',
        ...(requestedRole ? { requestedRole: requestedRole.toUpperCase() } : {}),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('Invalid credentials. Please check your ID/email and password.');
      } else if (res.status === 429) {
        throw new Error('Too many login attempts. Please wait 15 minutes and try again.');
      } else if (res.status >= 500) {
        throw new Error('Unable to connect to the authentication service. Please try again.');
      }
      throw new Error(errorData.message || 'Authentication failed');
    }

    const data: LoginResponse = await res.json();
    setAccessToken(data.accessToken);

    if (data.refreshToken) {
      try {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      } catch {
        // Ignored
      }
    }

    return data.user;
  },

  /**
   * Fetches currently authenticated user identity from GET /api/v1/auth/me
   */
  async getMe(): Promise<AuthUser> {
    const res = await fetchWithAuth('/api/v1/auth/me');

    if (!res.ok) {
      throw new Error('Failed to retrieve user profile');
    }

    const user: AuthUser = await res.json();
    return user;
  },

  /**
   * Restores session on browser refresh via POST /api/v1/auth/refresh
   */
  async restoreSession(): Promise<AuthUser | null> {
    if (!isAuthEnabled) {
      return null;
    }

    try {
      const fallbackToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || undefined;

      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: fallbackToken }),
      });

      if (!res.ok) {
        setAccessToken(null);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);

      if (data.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }

      // Authoritative profile retrieval
      const user = await this.getMe();
      return user;
    } catch {
      setAccessToken(null);
      return null;
    }
  },

  /**
   * Logs out user via POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    const fallbackToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || undefined;

    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: fallbackToken }),
      });
    } catch {
      // Ignored
    } finally {
      setAccessToken(null);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Changes authenticated user password via POST /api/v1/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetchWithAuth('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to change password');
    }
  },
};
