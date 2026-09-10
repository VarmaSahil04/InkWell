// ── Signup View ──────────────────────────────────────────────
import { signup } from '../api.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';
import { showToast } from '../toast.js';

export function renderSignup() {
  renderNav();

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="auth-layout page-enter">
      <div class="auth-card">
        <div class="auth-card__header">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;margin-bottom:var(--space-6);">
            Ink<span style="color:var(--text-accent)">well</span>
          </div>
          <h1 class="auth-card__title">Start your journal.</h1>
          <p class="auth-card__subtitle">A quiet place, just for you.</p>
        </div>

        <form id="signup-form" novalidate>
          <div id="signup-alert" role="alert"></div>

          <div class="form-group">
            <label class="label" for="signup-username">Username</label>
            <input
              class="input"
              type="text"
              id="signup-username"
              name="userName"
              autocomplete="username"
              placeholder="choose a username"
              required
            >
          </div>

          <div class="form-group">
            <label class="label" for="signup-email">Email</label>
            <input
              class="input"
              type="email"
              id="signup-email"
              name="email"
              autocomplete="email"
              placeholder="you@example.com"
            >
          </div>

          <div class="form-group">
            <label class="label" for="signup-password">Password</label>
            <input
              class="input"
              type="password"
              id="signup-password"
              name="password"
              autocomplete="new-password"
              placeholder="at least 6 characters"
              required
            >
          </div>

          <div class="form-group">
            <label class="label" for="signup-confirm">Confirm Password</label>
            <input
              class="input"
              type="password"
              id="signup-confirm"
              name="confirmPassword"
              autocomplete="new-password"
              placeholder="same again"
              required
            >
          </div>

          <div class="form-group" style="margin-top:var(--space-6)">
            <button class="btn btn--primary btn--full btn--lg" type="submit" id="signup-submit">
              Create Account
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          Already have an account?
          <a href="#" id="to-login">Log in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('login');
  });

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSignup();
  });
}

async function handleSignup() {
  const alertEl = document.getElementById('signup-alert');
  const submitBtn = document.getElementById('signup-submit');

  const userName = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  alertEl.innerHTML = '';

  // Client-side validation
  if (!userName || !password || !confirm) {
    showAlert(alertEl, 'Username and password are required.');
    return;
  }

  if (password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters.');
    return;
  }

  if (password !== confirm) {
    showAlert(alertEl, 'Passwords don\'t match — check them again.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="btn__spinner"></span> Creating…`;

  try {
    const res = await signup({ userName, email, password });

    if (res.ok) {
      showToast('Account created! Log in to begin writing.', 'success');
      navigate('login');
    } else {
      const msg = res.text || res.data?.message || 'Something went wrong. Try a different username.';
      showAlert(alertEl, msg);
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showAlert(alertEl, 'Couldn\'t connect to the server. Is the app running?');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Create Account';
  }
}

function showAlert(el, msg) {
  el.innerHTML = `
    <div class="alert alert--error">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${msg}
    </div>`;
}
