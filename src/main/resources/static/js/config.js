// ── Config ───────────────────────────────────────────────────
// Single source of truth for the API base URL.
// Auto-detects the host in Docker/Cloud deployments with fallback to localhost:8081
export const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
  ? `${window.location.origin}/journal`
  : 'http://localhost:8081/journal';
