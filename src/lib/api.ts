// Centralized API Client configuration
import { getStoredToken, logoutAdmin } from '@/lib/auth-client';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Clean endpoint path
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const token = typeof window !== 'undefined' ? getStoredToken() : null;

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Automatically intercept 401 Unauthorized errors on Admin routes
  if (
    response.status === 401 &&
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin') &&
    window.location.pathname !== '/admin/login'
  ) {
    console.warn('⚠️ 401 Unauthorized detected - Logging out admin');
    logoutAdmin(true);
  }

  return response;
}

export default apiFetch;
