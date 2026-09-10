// ── Profile / Settings View ──────────────────────────────────
import { updateUser, deleteUser } from '../api.js';
import { clearToken, getUsername } from '../auth.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';
import { showModal } from '../modal.js';
import { showToast } from '../toast.js';

export function renderProfile() {
  renderNav();

  const username = getUsername() || 'you';

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-container page-enter">
      <div class="section-header">
        <h1 class="section-header__title">Settings</h1>
        <p class="section-header__subtitle">Signed in as <strong style="color:var(--text-accent)">${escHtml(username)}</strong></p>
      </div>

      <!-- Update credentials -->
      <div class="profile-section">
        <h2 class="profile-section__title">Update credentials</h2>
        <form id="update-form" novalidate>
          <div id="update-alert" role="alert"></div>

          <div class="form-group">
            <label class="label" for="new-username">New username</label>
            <input
              class="input"
              type="text"
              id="new-username"
              autocomplete="username"
              placeholder="${escHtml(username)}"
            >
            <span class="form-hint">Leave blank to keep current username</span>
          </div>

          <div class="form-group">
            <label class="label" for="new-password">New password</label>
            <input
              class="input"
              type="password"
              id="new-password"
              autocomplete="new-password"
              placeholder="New password"
            >
          </div>

          <div class="form-group">
            <label class="label" for="confirm-password">Confirm new password</label>
            <input
              class="input"
              type="password"
              id="confirm-password"
              autocomplete="new-password"
              placeholder="Same again"
            >
          </div>

          <button class="btn btn--primary" type="submit" id="update-btn">
            Save changes
          </button>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="danger-zone">
        <h2 class="danger-zone__title">Danger zone</h2>
        <p class="danger-zone__text">
          Deleting your account is permanent and cannot be undone.
          Your username, password, and all journal entries will be erased from the server.
        </p>
        <button class="btn btn--danger" id="delete-account-btn">
          Delete my account
        </button>
      </div>
    </div>
  `;

  // Update form
  document.getElementById('update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleUpdate(username);
  });

  // Delete account
  document.getElementById('delete-account-btn').addEventListener('click', handleDeleteAccount);
}

async function handleUpdate(currentUsername) {
  const alertEl = document.getElementById('update-alert');
  const btn = document.getElementById('update-btn');

  const newUsername = document.getElementById('new-username').value.trim();
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  alertEl.innerHTML = '';

  if (!newUsername && !newPassword) {
    showAlert(alertEl, 'Enter a new username or password to update.');
    return;
  }

  if (newPassword && newPassword !== confirmPassword) {
    showAlert(alertEl, 'Passwords don\'t match.');
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters.');
    return;
  }

  const finalUsername = newUsername || currentUsername;

  btn.disabled = true;
  btn.innerHTML = `<span class="btn__spinner"></span> Saving…`;

  try {
    const res = await updateUser({ userName: finalUsername, password: newPassword || undefined });

    if (res.ok || res.status === 204) {
      showToast('Credentials updated. Please sign in again with your new details.', 'success', 5000);
      // Clear token and redirect — username/password changed
      clearToken();
      navigate('login');
    } else {
      showAlert(alertEl, 'Update failed. Try again.');
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showAlert(alertEl, 'Something went wrong. Check your connection.');
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save changes';
  }
}

async function handleDeleteAccount() {
  const confirmed = await showModal({
    title: 'Delete your account?',
    body: 'Type DELETE to confirm. This removes your account and all journal entries forever.',
    confirmLabel: 'Delete my account',
    confirmClass: 'btn--danger',
    requireInput: true,
    requiredValue: 'DELETE',
  });

  if (!confirmed || confirmed !== 'DELETE') return;

  try {
    const res = await deleteUser();

    if (res.ok || res.status === 204) {
      clearToken();
      showToast('Your account has been deleted.', 'success');
      navigate('login');
    } else {
      showToast('Failed to delete account. Try again.', 'error');
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('Something went wrong deleting your account.', 'error');
    }
  }
}

function showAlert(el, msg) {
  el.innerHTML = `
    <div class="alert alert--error" style="margin-bottom:var(--space-4)">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${msg}
    </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
