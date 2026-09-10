// ── Entry Editor View (Create + Edit) ────────────────────────
import { createEntry, getEntry, updateEntry, deleteEntry } from '../api.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';
import { showModal } from '../modal.js';
import { showToast } from '../toast.js';

export async function renderEditor(params = {}) {
  renderNav();

  const { id } = params;
  const isEdit = !!id;

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-container page-enter">
      <button class="entry-detail__back" id="back-btn" aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to journal
      </button>

      <div id="editor-loading" style="display:none">
        <div class="skeleton skeleton--title" style="width:50%;margin-bottom:var(--space-6)"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text" style="width:80%"></div>
      </div>

      <form id="editor-form" class="editor" novalidate>
        <div id="editor-alert" role="alert"></div>

        <div class="form-group">
          <input
            class="editor__title-input"
            type="text"
            id="editor-title"
            placeholder="Give this entry a title…"
            maxlength="200"
            required
            aria-label="Entry title"
          >
        </div>

        <div class="form-group">
          <textarea
            class="editor__content-area input"
            id="editor-content"
            placeholder="What's on your mind today? Let it spill onto the page…"
            aria-label="Entry content"
          ></textarea>
        </div>

        <div class="editor__toolbar">
          <div class="editor__toolbar-left">
            <button type="submit" class="btn btn--primary" id="save-btn">
              ${isEdit ? 'Save changes' : 'Publish entry'}
            </button>
            <button type="button" class="btn btn--ghost" id="cancel-btn">Cancel</button>
          </div>

          ${isEdit ? `
            <button type="button" class="btn btn--danger btn--sm" id="delete-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete entry
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    if (isEdit) {
      navigate('entry', { id });
    } else {
      navigate('dashboard');
    }
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    if (isEdit) {
      navigate('entry', { id });
    } else {
      navigate('dashboard');
    }
  });

  // Load existing entry for edit
  if (isEdit) {
    await loadEntry(id);
  }

  // Form submit
  document.getElementById('editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSave(id, isEdit);
  });

  // Delete button
  if (isEdit) {
    document.getElementById('delete-btn')?.addEventListener('click', () => handleDelete(id));
  }
}

async function loadEntry(id) {
  const loadingEl = document.getElementById('editor-loading');
  const formEl = document.getElementById('editor-form');

  loadingEl.style.display = '';
  formEl.style.display = 'none';

  try {
    const res = await getEntry(id);
    if (res.ok && res.data) {
      document.getElementById('editor-title').value = res.data.title || '';
      document.getElementById('editor-content').value = res.data.content || '';
    } else {
      showAlert(document.getElementById('editor-alert'), 'Could not load this entry.');
    }
  } catch {
    showAlert(document.getElementById('editor-alert'), 'Failed to load entry.');
  } finally {
    loadingEl.style.display = 'none';
    formEl.style.display = '';
  }
}

async function handleSave(id, isEdit) {
  const alertEl = document.getElementById('editor-alert');
  const saveBtn = document.getElementById('save-btn');

  const title = document.getElementById('editor-title').value.trim();
  const content = document.getElementById('editor-content').value.trim();

  alertEl.innerHTML = '';

  if (!title) {
    showAlert(alertEl, 'Every entry needs a title, even just a few words.');
    document.getElementById('editor-title').focus();
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="btn__spinner"></span> ${isEdit ? 'Saving…' : 'Publishing…'}`;

  try {
    let res;
    if (isEdit) {
      res = await updateEntry(id, { title, content });
      if (res.ok) {
        showToast('Entry updated.', 'success');
        navigate('entry', { id });
      } else {
        showAlert(alertEl, 'Failed to update entry. Try again.');
      }
    } else {
      res = await createEntry({ title, content });
      if (res.ok) {
        showToast('Entry published. ✦', 'success');
        navigate('dashboard');
      } else {
        showAlert(alertEl, 'Failed to create entry. Try again.');
      }
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showAlert(alertEl, 'Something went wrong. Check your connection.');
    }
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = isEdit ? 'Save changes' : 'Publish entry';
  }
}

async function handleDelete(id) {
  const confirmed = await showModal({
    title: 'Delete this entry?',
    body: 'This page will be gone for good. There\'s no undo.',
    confirmLabel: 'Yes, delete it',
    confirmClass: 'btn--danger',
  });

  if (!confirmed) return;

  try {
    const res = await deleteEntry(id);
    if (res.ok || res.status === 204) {
      showToast('Entry deleted.', 'success');
      navigate('dashboard');
    } else if (res.status === 404) {
      showToast('Entry not found — it may already be deleted.', 'error');
      navigate('dashboard');
    } else {
      showToast('Failed to delete. Try again.', 'error');
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('Something went wrong deleting this entry.', 'error');
    }
  }
}

function showAlert(el, msg) {
  el.innerHTML = `
    <div class="alert alert--error">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${msg}
    </div>`;
}
