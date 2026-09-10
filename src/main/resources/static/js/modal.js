// ── Custom Modal ─────────────────────────────────────────────
// A single shared modal for confirm dialogs throughout the app.

const overlay = () => document.getElementById('modal-overlay');
const titleEl = () => document.getElementById('modal-title');
const bodyEl = () => document.getElementById('modal-body');
const inputWrap = () => document.getElementById('modal-input-wrap');
const inputEl = () => document.getElementById('modal-input');
const cancelBtn = () => document.getElementById('modal-cancel');
const confirmBtn = () => document.getElementById('modal-confirm');

let _resolve = null;

/**
 * Show the modal and resolve with true (confirmed) or false (cancelled).
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.confirmLabel='Confirm']
 * @param {string} [opts.confirmClass='btn--danger']
 * @param {boolean} [opts.requireInput=false] - if true, shows a text input
 * @param {string} [opts.requiredValue] - if set, confirm only enabled when input matches
 * @returns {Promise<boolean|string>} - true/false, or input value string if requireInput
 */
export function showModal({
  title,
  body,
  confirmLabel = 'Confirm',
  confirmClass = 'btn--danger',
  requireInput = false,
  requiredValue = null,
}) {
  titleEl().textContent = title;
  bodyEl().textContent = body;
  confirmBtn().textContent = confirmLabel;
  confirmBtn().className = `btn ${confirmClass}`;

  if (requireInput) {
    inputWrap().classList.remove('hidden');
    inputEl().value = '';
    inputEl().placeholder = requiredValue ? `Type "${requiredValue}" to confirm` : '';

    if (requiredValue) {
      confirmBtn().disabled = true;
      inputEl().oninput = () => {
        confirmBtn().disabled = inputEl().value.trim() !== requiredValue;
      };
    }
  } else {
    inputWrap().classList.add('hidden');
    confirmBtn().disabled = false;
  }

  overlay().classList.remove('hidden');

  return new Promise((resolve) => {
    _resolve = resolve;

    confirmBtn().onclick = () => {
      close();
      resolve(requireInput ? inputEl().value : true);
    };

    cancelBtn().onclick = () => {
      close();
      resolve(false);
    };

    overlay().onclick = (e) => {
      if (e.target === overlay()) {
        close();
        resolve(false);
      }
    };
  });
}

function close() {
  overlay().classList.add('hidden');
  _resolve = null;
}
