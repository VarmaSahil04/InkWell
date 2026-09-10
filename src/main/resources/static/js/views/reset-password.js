// ── Reset Password View ──────────────────────────────────────
import { resetPassword } from '../api.js';
import { navigate, getParams } from '../router.js';
import { renderNav } from '../nav.js';
import { showToast } from '../toast.js';

export function renderResetPassword() {
  renderNav();

  const params = getParams();
  const token = params.token ? params.token.trim() : null;

  const main = document.getElementById('main-content');

  if (!token) {
    main.innerHTML = `
      <div class="auth-layout page-enter">
        <div class="auth-card" style="text-align:center;">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;margin-bottom:var(--space-6);">
            Ink<span style="color:var(--text-accent)">well</span>
          </div>
          <div style="font-size:2.5rem;margin-bottom:var(--space-4);">🔗</div>
          <h1 class="auth-card__title">Invalid Reset Link</h1>
          <p class="auth-card__subtitle" style="margin-bottom:var(--space-6);">
            This password reset link is missing a valid security token or has already been used.
          </p>
          <button class="btn btn--primary" id="to-forgot-btn">Request a new reset link</button>
        </div>
      </div>
    `;
    document.getElementById('to-forgot-btn')?.addEventListener('click', () => {
      navigate('forgot-password');
    });
    return;
  }

  main.innerHTML = `
    <div class="auth-layout page-enter">
      <div class="auth-card">
        <div class="auth-card__header">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;margin-bottom:var(--space-6);">
            Ink<span style="color:var(--text-accent)">well</span>
          </div>
          <h1 class="auth-card__title">Choose a new password.</h1>
          <p class="auth-card__subtitle">Enter and confirm your new password below.</p>
        </div>

        <div id="reset-alert" role="alert"></div>

        <form id="reset-form" novalidate>
          <div class="form-group">
            <label class="label" for="reset-new-password">New Password</label>
            <input
              class="input"
              type="password"
              id="reset-new-password"
              name="newPassword"
              autocomplete="new-password"
              placeholder="at least 6 characters"
              required
            >
          </div>

          <div class="form-group">
            <label class="label" for="reset-confirm-password">Confirm New Password</label>
            <input
              class="input"
              type="password"
              id="reset-confirm-password"
              name="confirmPassword"
              autocomplete="new-password"
              placeholder="same again"
              required
            >
          </div>

          <div class="form-group" style="margin-top:var(--space-6)">
            <button class="btn btn--primary btn--full btn--lg" type="submit" id="reset-submit">
              Update Password
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          <a href="#" id="to-login-link">Back to log in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('to-login-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('login');
  });

  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleResetPassword(token);
  });
}

async function handleResetPassword(token) {
  const alertEl = document.getElementById('reset-alert');
  const submitBtn = document.getElementById('reset-submit');

  const newPassword = document.getElementById('reset-new-password').value;
  const confirmPassword = document.getElementById('reset-confirm-password').value;

  alertEl.innerHTML = '';

  if (!newPassword || !confirmPassword) {
    showAlert(alertEl, 'Please fill in both password fields.');
    return;
  }

  if (newPassword.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters.');
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert(alertEl, 'Passwords do not match. Please verify.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="btn__spinner"></span> Updating…`;

  try {
    const res = await resetPassword({ token, newPassword });

    if (res.ok) {
      showToast('Password successfully updated! Please log in.', 'success', 5000);
      navigate('login');
    } else {
      const msg = res.text || 'Failed to reset password. The link may have expired.';
      showAlert(alertEl, msg);
    }
  } catch (err) {
    showAlert(alertEl, 'Could not reach the server. Please check your connection.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Update Password';
  }
}

function showAlert(el, msg) {
  el.innerHTML = `
    <div class="alert alert--error" style="margin-bottom:var(--space-4);">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${msg}
    </div>`;
}
