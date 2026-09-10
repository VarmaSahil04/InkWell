// ── API Client ───────────────────────────────────────────────
import { API_BASE } from './config.js';
import { getToken, clearToken } from './auth.js';
import { showToast } from './toast.js';

// Direct hash navigation for 401 redirects (avoids circular dependency with router.js)
function redirectToLogin() {
  window.location.hash = '#/login';
}

/**
 * Core fetch wrapper. Handles:
 * - Attaching JWT if available
 * - Content-Type for JSON bodies
 * - 401 → clear token, redirect to login
 * - Parsing JSON or text responses
 *
 * @param {string} path - e.g. '/public/login'
 * @param {object} options - { method, body, isText }
 * @returns {Promise<{ ok, status, data, text }>}
 */
async function request(path, { method = 'GET', body = null, isText = false } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {};

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !isText) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // Handle 401 globally — token expired or invalid
  if (res.status === 401) {
    clearToken();
    showToast('Your session has expired. Please sign in again.', 'error');
    redirectToLogin();
    throw new Error('Unauthorized');
  }

  // Parse response
  const contentType = res.headers.get('Content-Type') || '';
  let data = null;
  let text = '';

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    text = await res.text();
  }

  return { ok: res.ok, status: res.status, data, text };
}

// ── Public endpoints ─────────────────────────────────────────

export async function signup({ userName, email, password }) {
  return request('/public/signup', {
    method: 'POST',
    body: { userName, email, password },
  });
}

export async function login({ userName, password }) {
  return request('/public/login', {
    method: 'POST',
    body: { userName, password },
  });
}

export async function healthCheck() {
  return request('/public/health-check');
}

export async function forgotPassword({ identifier }) {
  return request('/public/forgot-password', {
    method: 'POST',
    body: { identifier },
  });
}

export async function resetPassword({ token, newPassword }) {
  return request('/public/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  });
}

// ── Journal endpoints ────────────────────────────────────────

export async function getEntries() {
  const res = await request('/journal');
  // 404 means "no entries yet" — treat as empty list
  if (res.status === 404) {
    return { ok: true, status: 200, data: [], text: '' };
  }
  return res;
}

export async function createEntry({ title, content }) {
  return request('/journal', {
    method: 'POST',
    body: { title, content },
  });
}

export async function getEntry(id) {
  return request(`/journal/id/${id}`);
}

export async function updateEntry(id, { title, content }) {
  return request(`/journal/id/${id}`, {
    method: 'PUT',
    body: { title, content },
  });
}

export async function deleteEntry(id) {
  return request(`/journal/id/${id}`, {
    method: 'DELETE',
  });
}

// ── User endpoints ───────────────────────────────────────────

export async function getUserGreeting() {
  return request('/user');
}

export async function updateUser({ userName, password }) {
  return request('/user', {
    method: 'PUT',
    body: { userName, password },
  });
}

export async function deleteUser() {
  return request('/user', {
    method: 'DELETE',
  });
}

// ── Admin endpoints ──────────────────────────────────────────

export async function getAllUsers() {
  return request('/admin/all-users');
}

export async function createAdminUser({ userName, password }) {
  return request('/admin/create-admin-user', {
    method: 'POST',
    body: { userName, password },
  });
}

export async function deleteUserByAdmin(userName) {
  return request(`/admin/delete-user/${encodeURIComponent(userName)}`, {
    method: 'DELETE',
  });
}
