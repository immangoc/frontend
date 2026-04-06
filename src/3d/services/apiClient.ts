// Uses the main app's token (ht_token) stored in localStorage.
const TOKEN_KEY = 'ht_token';
const BASE_URL = 'http://localhost:8080/api/v1';

// ── Token helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── JWT decode (no library needed) ─────────────────────────────────────────

export interface JwtUser {
  username: string;
  role: string;
}

export function decodeJwtUser(token: string): JwtUser | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return {
      username: payload.sub || payload.username || 'User',
      role: payload.role || (Array.isArray(payload.roles) ? payload.roles[0] : '') || 'OPERATOR',
    };
  } catch {
    return null;
  }
}

// ── Redirect ───────────────────────────────────────────────────────────────

export function redirectToUnauthorized(): void {
  clearToken();
  window.location.replace('/warehouse/login');
}

// ── API fetch wrapper ──────────────────────────────────────────────────────

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 401) {
    redirectToUnauthorized();
  }
  return res;
}
