// Centralized API Client configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Clean endpoint path
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...((options.headers as Record<string, string>) || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export default apiFetch;
