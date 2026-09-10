// ── Toast Notification System ────────────────────────────────

const container = () => document.getElementById('toast-container');

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration - ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3500) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;

  container().appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity 300ms ease, transform 300ms ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
