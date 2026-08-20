'use client';

export interface StoredAdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  avatar?: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function getStoredUser(): StoredAdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const decoded = atob(token);
    const data = JSON.parse(decoded);
    if (data.exp && Date.now() > data.exp) {
      return true; // Token has expired!
    }
    return false;
  } catch (e) {
    return true; // Corrupted token treated as expired
  }
}

export function logoutAdmin(redirect = true) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');

  if (redirect && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
    window.location.href = '/admin/login';
  }
}
