// ── Navigation ───────────────────────────────────────────────
import { isLoggedIn, clearToken, getIsAdmin } from './auth.js';
import { navigate, getCurrentRoute } from './router.js';

const navLinks = [
  {
    name: 'dashboard',
    label: 'My Journal',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  },
  {
    name: 'editor',
    label: 'New Entry',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    name: 'admin',
    label: 'Admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
    adminOnly: true,
  },
];

/**
 * Render the navigation.
 * @param {boolean} showAdmin - whether to show admin link
 */
export function renderNav(showAdmin = getIsAdmin()) {
  const navEl = document.getElementById('main-nav');

  if (!isLoggedIn()) {
    navEl.classList.add('nav--hidden');
    document.getElementById('main-content').classList.add('main--full');
    return;
  }

  navEl.classList.remove('nav--hidden');
  document.getElementById('main-content').classList.remove('main--full');

  const currentRoute = getCurrentRoute();

  const links = navLinks
    .filter(link => !link.adminOnly || showAdmin)
    .map(link => `
      <button
        class="nav__link ${currentRoute === link.name ? 'nav__link--active' : ''}"
        data-route="${link.name}"
        aria-label="${link.label}"
      >
        <span class="nav__link-icon" aria-hidden="true">${link.icon}</span>
        ${link.label}
      </button>
    `).join('');

  navEl.innerHTML = `
    <div class="nav__brand">
      <div class="nav__brand-name">Ink<span>well</span></div>
      <div class="nav__brand-tagline">Your private pages</div>
    </div>
    <nav class="nav__links" aria-label="Main navigation">
      ${links}
      <hr class="nav__divider">
    </nav>
    <div class="nav__footer">
      <button class="nav__link" id="logout-btn" style="width:100%">
        <span class="nav__link-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </span>
        Sign Out
      </button>
    </div>
  `;

  // Navigation clicks
  navEl.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.route);
    });
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearToken();
    navigate('login');
  });

  setupMobileNav(navEl);
}

function setupMobileNav(navEl) {
  // Create mobile toggle if not present
  let toggle = document.getElementById('nav-toggle');
  let backdrop = document.getElementById('nav-backdrop');

  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'nav-toggle';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    document.body.appendChild(toggle);

    backdrop = document.createElement('div');
    backdrop.id = 'nav-backdrop';
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  toggle.onclick = () => {
    navEl.classList.toggle('nav--open');
    backdrop.classList.toggle('nav-backdrop--visible');
  };

  backdrop.onclick = () => {
    navEl.classList.remove('nav--open');
    backdrop.classList.remove('nav-backdrop--visible');
  };

  // Close nav on route link click (mobile)
  navEl.querySelectorAll('[data-route], #logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navEl.classList.remove('nav--open');
      backdrop.classList.remove('nav-backdrop--visible');
    });
  });
}
