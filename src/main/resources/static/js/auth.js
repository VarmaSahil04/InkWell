// ── Auth helpers ─────────────────────────────────────────────

const TOKEN_KEY = 'inkwell_jwt';
const ADMIN_KEY = 'inkwell_is_admin';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getIsAdmin() {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

export function setIsAdmin(isAdmin) {
  if (isAdmin) {
    localStorage.setItem(ADMIN_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_KEY);
  }
}

/**
 * Decode a JWT payload (no verification — just for display purposes).
 * Returns null if the token is malformed.
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Get the username from the stored JWT, or null.
 */
export function getUsername() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.sub || null;
}
