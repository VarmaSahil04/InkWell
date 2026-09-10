// ── Login View ───────────────────────────────────────────────
import { login } from '../api.js';
import { setToken } from '../auth.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';

export function renderLogin() {
  renderNav();

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="auth-layout page-enter">
      <div class="auth-card">
        <div class="auth-card__header">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;margin-bottom:var(--space-6);">
            Ink<span style="color:var(--text-accent)">well</span>
          </div>
          <h1 class="auth-card__title">Welcome back.</h1>
          <p class="auth-card__subtitle">Your pages are waiting.</p>
        </div>

        <form id="login-form" novalidate>
          <div id="login-alert" role="alert"></div>

          <div class="form-group">
            <label class="label" for="login-username">Username</label>
            <input
              class="input"
              type="text"
              id="login-username"
              name="userName"
              autocomplete="username"
              placeholder="your.name"
              required
            >
          </div>

          <div class="form-group">
            <label class="label" for="login-password">Password</label>
            <input
              class="input"
              type="password"
              id="login-password"
              name="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            >
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:calc(-1 * var(--space-3));margin-bottom:var(--space-4);">
            <a href="#" id="to-forgot" style="font-size:var(--text-xs);color:var(--text-muted);text-decoration:none;">Forgot password?</a>
          </div>

          <div class="form-group" style="margin-top:var(--space-4)">
            <button class="btn btn--primary btn--full btn--lg" type="submit" id="login-submit">
              Open my journal
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          New here?
          <a href="#" id="to-signup">Create an account</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('to-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('forgot-password');
  });

  document.getElementById('to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('signup');
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });
}

async function handleLogin() {
  const alertEl = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-submit');
  const userName = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  alertEl.innerHTML = '';

  if (!userName || !password) {
    alertEl.innerHTML = `
      <div class="alert alert--error">
        <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Please enter your username and password.
      </div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="btn__spinner"></span> Signing in…`;

  try {
    const res = await login({ userName, password });

    if (res.ok) {
      const token = res.text.trim();
      setToken(token);
      navigate('dashboard');
    } else {
      const msg = res.text || 'Sign in failed. Please check your credentials.';
      // Map backend plain-text error to friendly message
      const friendly = msg.toLowerCase().includes('incorrect')
        ? 'That username or password doesn\'t look right. Try again.'
        : msg;
      alertEl.innerHTML = `
        <div class="alert alert--error">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ${friendly}
        </div>`;
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      alertEl.innerHTML = `
        <div class="alert alert--error">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Couldn't connect to the server. Is the app running?
        </div>`;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Open my journal';
  }
}
