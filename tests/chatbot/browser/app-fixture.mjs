import { test as base, expect } from '@playwright/test';
import { personId, profileId, serviceRows, studentId } from '../fixtures.mjs';

export const sessionKey = 'sb-chatbot-test-auth-token';
export function authSession(id = profileId) {
  const user = { id, email: 'student@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} };
  const payload = Buffer.from(JSON.stringify({ sub: id, exp: 4102444800, role: 'authenticated' })).toString('base64url');
  return { access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.test-signature`, refresh_token: 'test-only-refresh-token', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user };
}

/** @param {import('@playwright/test').Page} page */
async function createApp(page) {
    const state = {
      role: 'student', active: true, status: 'active', authenticated: true, linked: true,
      profileId, name: 'Ana Prueba', rows: serviceRows(), calls: [], writes: [], unexpected: [],
      mode: 'success', delay: false, pending: [], authDelay: false, authPending: [],
    };
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === 'http://127.0.0.1:4178') return route.continue();
      state.unexpected.push(new URL(route.request().url()).hostname);
      return route.abort();
    });
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key: sessionKey, session: authSession() });
    await page.route('https://chatbot-test.supabase.co/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
      if (url.pathname === '/auth/v1/user') {
        if (state.authDelay) await new Promise(resolve => state.authPending.push(resolve));
        return state.authenticated ? json(authSession(state.profileId).user) : json({ message: 'Synthetic expired session' }, 401);
      }
      if (url.pathname === '/auth/v1/logout') { state.authenticated = false; return json({}); }
      // The existing administrator landing page uses this SELECT-only RPC during setup.
      if (state.role === 'superadmin' && request.method() === 'POST' && url.pathname === '/rest/v1/rpc/list_enrollment_requests') return json([]);
      if (state.role === 'superadmin' && request.method() === 'GET' && url.pathname === '/rest/v1/courses') return json([]);
      if (request.method() !== 'GET') {
        state.writes.push({ path: url.pathname, method: request.method() });
        return json({ message: 'Unexpected write blocked by test boundary' }, 403);
      }
      const table = url.pathname.replace('/rest/v1/', '');
      state.calls.push({ table, query: url.searchParams.toString() });
      if (table === 'profiles') return json({ id: state.profileId, email: 'student@example.test', full_name: state.name, role: state.role, is_active: state.active, account_status: state.status });
      if (table === 'people') return json(state.linked ? { id: personId, profile_id: state.profileId, is_active: true } : null);
      const services = ['student_transport_enrollments', 'student_sport_enrollments'];
      if (services.includes(table)) {
        const mode = state.mode;
        const rows = structuredClone(state.rows[table]);
        if (state.delay) await new Promise(resolve => state.pending.push(resolve));
        if (mode === 'network') return route.abort('failed');
        if (mode === 'error') return json({ message: 'Synthetic internal error: never show this', code: 'TEST_ERROR' }, 500);
        return json(mode === 'empty' ? [] : rows.filter(row => url.searchParams.get('is_active') !== 'eq.true' || row.is_active));
      }
      if (table === 'students') return json(state.linked ? [{ id: studentId, person_id: personId, is_active: true, student_number: 'TEST-01', person: { first_name: 'Ana', last_name: 'Prueba' } }] : []);
      if (['student_enrollments', 'student_subject_enrollments', 'student_dining_enrollments', 'student_guardians', 'academic_history', 'academic_schedules', 'forum_discussions', 'teachers', 'course_subjects', 'news', 'enrollment_requests'].includes(table)) return json([]);
      state.unexpected.push(table);
      return json({ message: `Unhandled test table: ${table}` }, 500);
    });
    const app = {
      state,
      panel: () => page.getByRole('dialog', { name: /ayuda/i }),
      async visit(path = '/alumnos') {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        if (state.role === 'student' && state.active && state.status === 'active' && state.authenticated) {
          await expect(page.getByText('Portal del alumno', { exact: true })).toBeVisible({ timeout: 10000 });
          if (path === '/alumnos') await expect(page.getByRole('heading', { name: state.linked ? 'Tu recorrido escolar, en un solo lugar.' : 'Tu legajo todavía no está vinculado' })).toBeVisible({ timeout: 10000 });
        } else {
          await expect(page).not.toHaveURL(/\/alumnos(?:\/|$)/, { timeout: 10000 });
        }
        if (state.role === 'student' && state.active && state.status === 'active' && state.authenticated) state.calls.length = 0;
      },
      async open() {
        // The missing launcher is a behavior failure, not a missing-module test failure.
        await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Ayuda', exact: true }).click();
        await expect(app.panel()).toBeVisible();
      },
      async choose(label) { await app.panel().getByRole('button', { name: label, exact: true }).click(); },
      async topic(label) { await app.open(); await app.choose(label); },
      release() { state.delay = false; state.pending.splice(0).forEach(resolve => resolve()); },
      async changeAccount(id = null) {
        state.authenticated = id !== null;
        if (id) { state.profileId = id; state.name = 'Bruno Prueba'; state.rows = { student_transport_enrollments: [], student_sport_enrollments: [] }; }
        await page.evaluate(({ key, value }) => {
          const oldValue = localStorage.getItem(key);
          if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
          window.dispatchEvent(new StorageEvent('storage', { key, oldValue, newValue: value, storageArea: localStorage }));
        }, { key: sessionKey, value: id ? JSON.stringify(authSession(id)) : null });
      },
    };
    return { app, cleanup() {
      app.release(); state.authPending.splice(0).forEach(resolve => resolve());
      expect(state.writes, 'No service/RPC writes are allowed').toEqual([]);
      expect(state.unexpected, 'Unexpected mock requests require explicit fixture support').toEqual([]);
    } };
}

/** @type {import('@playwright/test').Fixtures<{app: Awaited<ReturnType<typeof createApp>>['app']}, {}, import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions>} */
const fixtures = {
  app: async ({ page }, use) => {
    const setup = await createApp(page);
    try { await use(setup.app); } finally { setup.cleanup(); }
  },
};
export const test = base.extend(fixtures);
export { expect };
