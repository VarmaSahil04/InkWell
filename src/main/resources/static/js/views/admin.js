// ── Admin Panel View ─────────────────────────────────────────
import { getAllUsers, createAdminUser, deleteUserByAdmin } from '../api.js';
import { renderNav } from '../nav.js';
import { showToast } from '../toast.js';
import { showModal } from '../modal.js';
import { setIsAdmin } from '../auth.js';

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderAdmin() {
  renderNav(true); // show admin link

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-container page-container--wide page-enter">
      <div class="section-header">
        <h1 class="section-header__title">Admin Panel</h1>
        <p class="section-header__subtitle">Manage users and create admin accounts</p>
      </div>

      <div class="admin-grid">
        <!-- Create Admin User -->
        <div class="admin-panel">
          <h2 class="admin-panel__title">Create admin user</h2>
          <form id="create-admin-form" novalidate>
            <div id="admin-form-alert" role="alert"></div>
            <div class="admin-panel__form">
              <div class="form-group">
                <label class="label" for="admin-username">Username</label>
                <input class="input" type="text" id="admin-username" placeholder="admin_name" required>
              </div>
              <div class="form-group">
                <label class="label" for="admin-password">Password</label>
                <input class="input" type="password" id="admin-password" placeholder="••••••••" required>
              </div>
              <button class="btn btn--primary" type="submit" id="create-admin-btn" style="margin-top:24px">
                Create admin
              </button>
            </div>
          </form>
        </div>

        <!-- All Users -->
        <div class="admin-panel">
          <h2 class="admin-panel__title">All users</h2>
          <div id="users-loading">
            <div class="skeleton skeleton--text" style="width:40%;margin-bottom:8px"></div>
            <div class="skeleton skeleton--text" style="width:60%"></div>
            <div class="skeleton skeleton--text" style="width:50%;margin-top:8px"></div>
          </div>
          <div class="table-wrap">
            <table class="data-table hidden" id="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th style="text-align:right">Action</th>
                </tr>
              </thead>
              <tbody id="users-tbody"></tbody>
            </table>
          </div>
          <div id="users-error" class="hidden">
            <div class="alert alert--error" style="margin-top:var(--space-4)">
              <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span id="users-error-msg">Access denied or server error.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load users
  loadUsers();

  // Create admin form
  document.getElementById('create-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCreateAdmin();
  });
}

async function loadUsers() {
  try {
    const res = await getAllUsers();

    document.getElementById('users-loading').style.display = 'none';

    if (res.ok && res.data) {
      setIsAdmin(true);
      renderNav(true);
      const users = Array.isArray(res.data) ? res.data : [];
      renderUsersTable(users);
    } else if (res.status === 403) {
      setIsAdmin(false);
      renderNav(false);
      showAccessDenied('You don\'t have admin access. This section is restricted to administrators.');
    } else if (res.status === 404) {
      setIsAdmin(true);
      renderNav(true);
      renderUsersTable([]);
    } else {
      showAccessDenied('Failed to load users. Check your permissions.');
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      document.getElementById('users-loading').style.display = 'none';
      showAccessDenied('Server error. Could not load users.');
    }
  }
}

function renderUsersTable(users) {
  const table = document.getElementById('users-table');
  const tbody = document.getElementById('users-tbody');

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:var(--space-6)">No users found.</td></tr>`;
  } else {
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${escHtml(u.userName || '—')}</strong></td>
        <td>${escHtml(u.email || '—')}</td>
        <td>${(u.roles || []).map(r => `<span class="sentiment-tag" style="background:rgba(245,158,11,0.1);color:var(--amber-300)">${escHtml(r)}</span>`).join(' ')}</td>
        <td style="text-align:right">
          <button class="btn btn--danger btn--sm delete-user-btn" data-username="${escHtml(u.userName)}" title="Delete user">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Attach delete confirmation to buttons
    tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetUser = btn.dataset.username;
        const confirmed = await showModal({
          title: `Delete user "${targetUser}"?`,
          body: `Are you sure you want to delete this user? This will remove their account and all their journal entries permanently.`,
          confirmLabel: 'Yes, delete user',
          confirmClass: 'btn--danger',
        });
        if (!confirmed) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="btn__spinner"></span>`;

        try {
          const res = await deleteUserByAdmin(targetUser);
          if (res.ok || res.status === 204) {
            showToast(`User "${targetUser}" deleted.`, 'success');
            loadUsers();
          } else {
            showToast(`Failed to delete "${targetUser}".`, 'error');
            btn.disabled = false;
            btn.innerHTML = 'Delete';
          }
        } catch (err) {
          showToast('Error deleting user.', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Delete';
        }
      });
    });
  }

  table.classList.remove('hidden');
}

function showAccessDenied(msg) {
  const errorEl = document.getElementById('users-error');
  document.getElementById('users-error-msg').textContent = msg;
  errorEl.classList.remove('hidden');
}

async function handleCreateAdmin() {
  const alertEl = document.getElementById('admin-form-alert');
  const btn = document.getElementById('create-admin-btn');

  const userName = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;

  alertEl.innerHTML = '';

  if (!userName || !password) {
    alertEl.innerHTML = `<div class="alert alert--error" style="margin-bottom:var(--space-4)">Username and password are required.</div>`;
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="btn__spinner"></span> Creating…`;

  try {
    const res = await createAdminUser({ userName, password });

    if (res.ok || res.status === 204) {
      showToast(`Admin user "${userName}" created.`, 'success');
      document.getElementById('admin-username').value = '';
      document.getElementById('admin-password').value = '';
      // Reload users table
      document.getElementById('users-loading').style.display = '';
      document.getElementById('users-table').classList.add('hidden');
      loadUsers();
    } else if (res.status === 403) {
      alertEl.innerHTML = `<div class="alert alert--error" style="margin-bottom:var(--space-4)">Access denied. Only admins can create admin users.</div>`;
    } else {
      alertEl.innerHTML = `<div class="alert alert--error" style="margin-bottom:var(--space-4)">Failed to create user. Check if username is already taken.</div>`;
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      alertEl.innerHTML = `<div class="alert alert--error" style="margin-bottom:var(--space-4)">Connection error.</div>`;
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create admin';
  }
}
