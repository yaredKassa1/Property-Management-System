import { User } from './types';

export const AUTH_TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function setUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token && token !== 'undefined' && token !== 'null';
}

export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Navigation lock to prevent redirect loops
const NAV_LOCK_KEY = '_nav_lock';
const NAV_LOCK_DURATION = 1000; // 1 second

export function acquireNavigationLock(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lockData = sessionStorage.getItem(NAV_LOCK_KEY);
  if (lockData) {
    const { timestamp } = JSON.parse(lockData);
    const now = Date.now();
    // If lock is still valid (within duration), deny
    if (now - timestamp < NAV_LOCK_DURATION) {
      console.log('[NavLock] Lock already held, denying navigation');
      return false;
    }
  }
  
  // Acquire lock
  sessionStorage.setItem(NAV_LOCK_KEY, JSON.stringify({ timestamp: Date.now() }));
  console.log('[NavLock] Lock acquired');
  return true;
}

export function releaseNavigationLock(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(NAV_LOCK_KEY);
    console.log('[NavLock] Lock released');
  }
}
