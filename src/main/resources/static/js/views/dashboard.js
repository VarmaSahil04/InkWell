// ── Dashboard View ───────────────────────────────────────────
import { getEntries, getUserGreeting, getAllUsers } from '../api.js';
import { navigate } from '../router.js';
import { renderNav } from '../nav.js';
import { setIsAdmin } from '../auth.js';

// ── Helpers ──────────────────────────────────────────────────

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

function entryCard(entry, index) {
  const preview = entry.content
    ? entry.content.replace(/\s+/g, ' ').slice(0, 180) + (entry.content.length > 180 ? '…' : '')
    : 'No content.';

  return `
    <article
      class="entry-card"
      data-id="${entry.id}"
      tabindex="0"
      role="button"
      aria-label="Open entry: ${entry.title}"
      style="animation-delay:${index * 60}ms"
    >
      <div class="entry-card__date">${formatDate(entry.date)}</div>
      <h2 class="entry-card__title">${escHtml(entry.title)}</h2>
      <p class="entry-card__preview">${escHtml(preview)}</p>
      <div class="entry-card__meta">
        ${sentimentTag(entry.sentiment)}
      </div>
    </article>
  `;
}

function skeletonCards() {
  return Array.from({ length: 3 }, () => `
    <div class="entry-card">
      <div class="skeleton skeleton--text" style="width:30%"></div>
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:70%"></div>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render ───────────────────────────────────────────────────

export async function renderDashboard() {
  renderNav();

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-container page-container--wide page-enter">

      <div id="welcome-bar" class="welcome-bar" style="display:none" aria-live="polite"></div>

      <div class="dashboard-header">
        <div class="section-header" style="margin-bottom:0">
          <h1 class="section-header__title">Your Pages</h1>
          <p class="section-header__subtitle" id="entry-count"></p>
        </div>
        <div class="dashboard-header__actions">
          <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="input" type="search" id="search-input" placeholder="Filter by title…" aria-label="Search entries">
          </div>
          <button class="btn btn--primary" id="new-entry-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New entry
          </button>
        </div>
      </div>

      <div id="entries-container" class="entries-grid entries-grid--staggered">
        ${skeletonCards()}
      </div>
    </div>
  `;

  // New entry button
  document.getElementById('new-entry-btn').addEventListener('click', () => {
    navigate('editor');
  });

  // Load data in parallel
  const [entriesRes, greetRes] = await Promise.allSettled([
    getEntries(),
    getUserGreeting(),
  ]);

  // Welcome bar
  if (greetRes.status === 'fulfilled' && greetRes.value.ok) {
    const bar = document.getElementById('welcome-bar');
    bar.textContent = greetRes.value.text || greetRes.value.data || '';
    bar.style.display = '';
  }

  // Entries
  if (entriesRes.status === 'fulfilled' && entriesRes.value.ok) {
    const entries = entriesRes.value.data || [];
    renderEntries(entries);
  } else {
    renderError();
  }

  // Probe admin status silently so sidebar nav shows "Admin" for admins automatically
  getAllUsers().then(res => {
    if (res.ok || res.status === 404) {
      setIsAdmin(true);
      renderNav(true);
    } else if (res.status === 403) {
      setIsAdmin(false);
    }
  }).catch(() => {});
}

function renderEntries(all) {
  const container = document.getElementById('entries-container');
  const countEl = document.getElementById('entry-count');
  const searchInput = document.getElementById('search-input');

  if (!container) return;

  // Sort newest first
  all.sort((a, b) => new Date(b.date) - new Date(a.date));

  function display(list) {
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon">📖</div>
          <h2 class="empty-state__title">Your first page is waiting</h2>
          <p class="empty-state__text">
            Nothing here yet — and that's okay. Every great journal starts with a single sentence.
          </p>
          <button class="btn btn--primary" id="empty-new-btn">Write your first entry</button>
        </div>`;
      document.getElementById('empty-new-btn')?.addEventListener('click', () => navigate('editor'));
    } else {
      container.innerHTML = list.map((e, i) => entryCard(e, i)).join('');
      container.querySelectorAll('.entry-card').forEach(card => {
        card.addEventListener('click', () => navigate('entry', { id: card.dataset.id }));
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('entry', { id: card.dataset.id });
          }
        });
      });
    }
  }

  display(all);

  countEl.textContent = all.length === 0
    ? ''
    : `${all.length} entr${all.length === 1 ? 'y' : 'ies'}`;

  // Live search / filter
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const filtered = q ? all.filter(e => e.title.toLowerCase().includes(q)) : all;
    display(filtered);
    countEl.textContent = q
      ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`
      : `${all.length} entr${all.length === 1 ? 'y' : 'ies'}`;
  });
}

function renderError() {
  const container = document.getElementById('entries-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state__icon">⚠</div>
      <h2 class="empty-state__title">Couldn't load entries</h2>
      <p class="empty-state__text">Something went wrong fetching your journal. Try refreshing the page.</p>
    </div>`;
}
