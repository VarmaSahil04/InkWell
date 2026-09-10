// ── Forgot Password View ─────────────────────────────────────
import { forgotPassword } from '../api.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';

export function renderForgotPassword() {
  renderNav();

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="auth-layout page-enter">
      <div class="auth-card">
        <div class="auth-card__header">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;margin-bottom:var(--space-6);">
            Ink<span style="color:var(--text-accent)">well</span>
          </div>
          <h1 class="auth-card__title">Reset password.</h1>
          <p class="auth-card__subtitle">Enter your email or username to receive a secure reset link.</p>
        </div>

        <div id="forgot-alert" role="alert"></div>

        <form id="forgot-form" novalidate>
          <div class="form-group">
            <label class="label" for="forgot-identifier">Email or Username</label>
            <input
              class="input"
              type="text"
              id="forgot-identifier"
              name="identifier"
              autocomplete="email"
              placeholder="you@example.com or username"
              required
            >
          </div>

          <div class="form-group" style="margin-top:var(--space-6)">
            <button class="btn btn--primary btn--full btn--lg" type="submit" id="forgot-submit">
              Send reset link
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          Remember your password?
          <a href="#" id="to-login">Log in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('login');
  });

  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleForgotPassword();
  });
}

async function handleForgotPassword() {
  const alertEl = document.getElementById('forgot-alert');
  const submitBtn = document.getElementById('forgot-submit');
  const identifier = document.getElementById('forgot-identifier').value.trim();

  alertEl.innerHTML = '';

  if (!identifier) {
    alertEl.innerHTML = `
      <div class="alert alert--error">
        <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Please enter your email or username.
      </div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="btn__spinner"></span> Sending…`;

  try {
    const res = await forgotPassword({ identifier });

    if (res.ok) {
      document.getElementById('forgot-form').style.display = 'none';
      alertEl.innerHTML = `
        <div class="alert alert--success" style="line-height:1.6;padding:var(--space-4);">
          <div>
            <strong>Check your inbox!</strong><br>
            If an account matches that username or email, a reset link has been dispatched via email. 
            The link is valid for <strong>15 minutes</strong>.
          </div>
        </div>`;
    } else {
      const msg = res.text || 'Something went wrong. Please try again.';
      alertEl.innerHTML = `
        <div class="alert alert--error">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ${msg}
        </div>`;
    }
  } catch (err) {
    alertEl.innerHTML = `
      <div class="alert alert--error">
        <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Could not connect to the server. Please check your connection.
      </div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send reset link';
  }
}
