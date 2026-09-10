// ── Entry Detail / Read View ─────────────────────────────────
import { getEntry, deleteEntry } from '../api.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';
import { showModal } from '../modal.js';
import { showToast } from '../toast.js';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function sentimentTag(sentiment) {
  if (!sentiment) return '';
  const map = {
    HAPPY:   { label: '☀ Happy',    cls: 'happy' },
    SAD:     { label: '🌧 Sad',      cls: 'sad' },
    ANGRY:   { label: '🔥 Angry',   cls: 'angry' },
    ANXIOUS: { label: '〰 Anxious', cls: 'anxious' },
  };
  const s = map[sentiment];
  if (!s) return '';
  return `<span class="sentiment-tag sentiment-tag--${s.cls}">${s.label}</span>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderEntryDetail(params = {}) {
  renderNav();

  const { id } = params;

  if (!id) {
    navigate('dashboard');
    return;
  }

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-container page-enter">
      <button class="entry-detail__back" id="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to journal
      </button>

      <div id="detail-loading">
        <div class="skeleton skeleton--text" style="width:25%;margin-bottom:var(--space-4)"></div>
        <div class="skeleton" style="height:52px;width:70%;margin-bottom:var(--space-4)"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text" style="width:90%;margin-top:var(--space-2)"></div>
        <div class="skeleton skeleton--text" style="width:60%;margin-top:var(--space-2)"></div>
      </div>

      <div id="detail-content" class="entry-detail" style="display:none" aria-live="polite"></div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => navigate('dashboard'));

  // Load the entry
  try {
    const res = await getEntry(id);

    document.getElementById('detail-loading').style.display = 'none';

    if (res.ok && res.data) {
      renderDetail(res.data);
    } else if (res.status === 404) {
      document.getElementById('detail-content').innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h2 class="empty-state__title">This page doesn't exist</h2>
          <p class="empty-state__text">It may have been deleted, or the link is wrong.</p>
          <button class="btn btn--secondary" onclick="navigate('dashboard')">Back to journal</button>
        </div>`;
      document.getElementById('detail-content').style.display = '';
    } else {
      document.getElementById('detail-content').innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠</div>
          <h2 class="empty-state__title">Couldn't load this entry</h2>
          <p class="empty-state__text">Something went wrong. Try going back and opening it again.</p>
        </div>`;
      document.getElementById('detail-content').style.display = '';
    }
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      document.getElementById('detail-loading').style.display = 'none';
      document.getElementById('detail-content').innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠</div>
          <h2 class="empty-state__title">Connection error</h2>
          <p class="empty-state__text">Couldn't reach the server. Please check the app is running.</p>
        </div>`;
      document.getElementById('detail-content').style.display = '';
    }
  }
}

function renderDetail(entry) {
  const container = document.getElementById('detail-content');
  container.style.display = '';

  // Format content preserving line breaks
  const formattedContent = escHtml(entry.content || '')
    .replace(/\n/g, '<br>');

  container.innerHTML = `
    <div class="entry-detail__date">${formatDate(entry.date)}</div>
    <h1 class="entry-detail__title">${escHtml(entry.title)}</h1>
    <div class="entry-detail__meta">
      ${sentimentTag(entry.sentiment)}
    </div>
    <hr class="divider divider--plain" style="margin:var(--space-6) 0">
    <div class="entry-detail__content">${formattedContent}</div>
    <div class="entry-detail__actions">
      <button class="btn btn--secondary" id="edit-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit this entry
      </button>
      <button class="btn btn--ghost" style="color:var(--red-400)" id="detail-delete-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        Delete
      </button>
    </div>
  `;

  document.getElementById('edit-btn').addEventListener('click', () => {
    navigate('editor', { id: entry.id });
  });

  document.getElementById('detail-delete-btn').addEventListener('click', async () => {
    const confirmed = await showModal({
      title: 'Delete this entry?',
      body: 'This page will be gone for good. There\'s no undo.',
      confirmLabel: 'Yes, delete it',
    });

    if (!confirmed) return;

    try {
      const res = await deleteEntry(entry.id);
      if (res.ok || res.status === 204) {
        showToast('Entry deleted.', 'success');
        navigate('dashboard');
      } else {
        showToast('Failed to delete. Try again.', 'error');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') {
        showToast('Something went wrong.', 'error');
      }
    }
  });
}
