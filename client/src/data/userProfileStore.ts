export interface UserProfile {
  contactNumber: string;
  emergencyContact: string;
  avatarUrl: string;
  password?: string;
  updatedAt?: string;
}

const STORAGE_PREFIX = 'syncampus_user_profile_';
const listeners: Array<() => void> = [];

export function subscribeUserProfile(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notify() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

export function getUserProfileKey(userIdOrEmail: string): string {
  return `${STORAGE_PREFIX}${userIdOrEmail.toLowerCase().trim()}`;
}

export function getUserProfile(userIdOrEmail: string): UserProfile {
  const defaultProfile: UserProfile = {
    contactNumber: '+91 98201 44521',
    emergencyContact: '+91 98190 33412 (Guardian)',
    avatarUrl: '',
    password: 'password123'
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const key = getUserProfileKey(userIdOrEmail);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...defaultProfile,
        ...parsed
      };
    }
  } catch (err) {
    console.warn('Failed to load user profile from localStorage', err);
  }

  return defaultProfile;
}

export function saveUserProfile(userIdOrEmail: string, updates: Partial<UserProfile>): UserProfile {
  const current = getUserProfile(userIdOrEmail);
  const updated: UserProfile = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      const key = getUserProfileKey(userIdOrEmail);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save user profile to localStorage', err);
    }
  }

  notify();
  return updated;
}

export function changeUserPassword(
  userIdOrEmail: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  const profile = getUserProfile(userIdOrEmail);
  const currentPassword = profile.password || 'password123';

  if (oldPass !== currentPassword) {
    return { success: false, message: 'Current password does not match our records.' };
  }

  if (!newPass || newPass.trim().length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  saveUserProfile(userIdOrEmail, { password: newPass.trim() });
  return { success: true, message: 'Login password updated successfully.' };
}
