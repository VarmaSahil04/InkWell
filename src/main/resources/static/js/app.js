// ── App Entry Point ──────────────────────────────────────────
// Wires up the router, registers all views, and starts the app.

import { registerRoute, startRouter } from './router.js?v=1.0.4';
import { renderLogin } from './views/login.js?v=1.0.4';
import { renderSignup } from './views/signup.js?v=1.0.4';
import { renderForgotPassword } from './views/forgot-password.js?v=1.0.4';
import { renderResetPassword } from './views/reset-password.js?v=1.0.4';
import { renderDashboard } from './views/dashboard.js?v=1.0.4';
import { renderEditor } from './views/editor.js?v=1.0.4';
import { renderEntryDetail } from './views/entry-detail.js?v=1.0.4';
import { renderProfile } from './views/profile.js?v=1.0.4';
import { renderAdmin } from './views/admin.js?v=1.0.4';

// ── Register routes ──────────────────────────────────────────
registerRoute('login',           renderLogin,          false); // public
registerRoute('signup',          renderSignup,         false); // public
registerRoute('forgot-password', renderForgotPassword, false); // public
registerRoute('reset-password',  renderResetPassword,  false); // public
registerRoute('dashboard',       renderDashboard,      true);  // protected
registerRoute('editor',          renderEditor,         true);  // protected (create + edit)
registerRoute('entry',           renderEntryDetail,    true);  // protected (read view)
registerRoute('profile',         renderProfile,        true);  // protected
registerRoute('admin',           renderAdmin,          true);  // protected (403 handled in view)

// ── Start ────────────────────────────────────────────────────
startRouter();
