const API_BASE = 'http://localhost:8000/api';

/**
 * Get the stored auth tokens from localStorage.
 */
export function getTokens() {
  if (typeof window === 'undefined') return null;
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  return access ? { access, refresh } : null;
}

/**
 * Store auth tokens in localStorage.
 */
export function setTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

/**
 * Clear auth tokens (logout).
 */
export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated() {
  return !!getTokens();
}

/**
 * Make an authenticated API request.
 */
export async function apiFetch(endpoint, options = {}) {
  const tokens = getTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh the token
  if (res.status === 401 && tokens?.refresh) {
    const refreshRes = await fetch(`${API_BASE}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.access, tokens.refresh);
      headers['Authorization'] = `Bearer ${data.access}`;
      return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return res;
}

/**
 * Register a new vendor.
 */
export async function registerUser(username, password) {
  const res = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return { ok: res.ok, data: await res.json() };
}

/**
 * Login and store tokens.
 */
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    setTokens(data.access, data.refresh);
  }
  return { ok: res.ok, data };
}
