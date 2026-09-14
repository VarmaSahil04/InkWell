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
              placeholder="your.name"
              maxlength="16"
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
              placeholder="••••••••"
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
              placeholder="••••••••"
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

  setupPasswordToggles(document.getElementById('signup-form'));
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

  if (userName.length > 16) {
    showAlert(alertEl, 'Username cannot exceed 16 characters.');
    return;
  }

  // Strict email validation — must have format: local@domain.tld
  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (email && !EMAIL_RE.test(email)) {
    showAlert(alertEl, 'Please enter a valid email address (e.g. you@example.com).');
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
      // res.text carries backend plain-text error; res.data?.message for JSON errors
      const msg = (res.text && res.text.trim())
        || res.data?.message
        || 'Something went wrong. Try a different username.';
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

function setupPasswordToggles(container) {
  if (!container) return;
  container.querySelectorAll('input[type="password"]').forEach(input => {
    if (input.parentElement.classList.contains('password-wrap')) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'password-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'password-toggle';
    btn.setAttribute('aria-label', 'Toggle password visibility');
    
    // Initial state: hidden password -> Crossed eye
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    
    btn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        // Visible -> Open eye
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      } else {
        input.type = 'password';
        // Hidden -> Crossed eye
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
      }
    });
    
    wrap.appendChild(btn);
  });
}
