// ── Hash-based SPA Router ────────────────────────────────────
import { isLoggedIn } from './auth.js';

const routes = {};
let currentRoute = null;

/**
 * Register a route handler.
 * @param {string} name - route name e.g. 'login', 'dashboard', 'editor'
 * @param {function} handler - async function(params) called when route activates
 * @param {boolean} protected_ - if true, redirects to login when not authenticated
 */
export function registerRoute(name, handler, protected_ = false) {
  routes[name] = { handler, protected_ };
}

/**
 * Navigate to a route.
 * @param {string} name
 * @param {object} [params] - e.g. { id: '...' }
 */
export function navigate(name, params = {}) {
  const paramStr = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  window.location.hash = `#/${name}${paramStr}`;
}

/**
 * Get current route params from hash.
 */
export function getParams() {
  const hash = window.location.hash || '#/login';
  const [, queryStr] = hash.split('?');
  if (!queryStr) return {};
  return Object.fromEntries(new URLSearchParams(queryStr));
}

/**
 * Parse the current route name from hash.
 */
function parseHash() {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') {
    return isLoggedIn() ? 'dashboard' : 'login';
  }
  const path = hash.replace(/^#\//, '').replace(/^#/, '').split('?')[0];
  return path || (isLoggedIn() ? 'dashboard' : 'login');
}

/**
 * Dispatch the current hash to the appropriate view.
 */
async function dispatch() {
  const name = parseHash();
  const route = routes[name];

  if (!route) {
    // Unknown route → go to dashboard if logged in, else login
    navigate(isLoggedIn() ? 'dashboard' : 'login');
    return;
  }

  // Guard protected routes
  if (route.protected_ && !isLoggedIn()) {
    navigate('login');
    return;
  }

  currentRoute = name;
  const params = getParams();
  await route.handler(params);
}

/**
 * Start the router — listen for hash changes.
 */
export function startRouter() {
  window.addEventListener('hashchange', dispatch);
  dispatch(); // Handle initial load
}

export function getCurrentRoute() {
  return currentRoute;
}
