import { test, expect, sessionKey } from './app-fixture.mjs';

for (const role of ['parent', 'teacher', 'superadmin', 'unknown']) {
  test(`A02: verified ${role} account cannot access the student chatbot`, async ({ app, page }) => {
    app.state.role = role; await app.visit();
    expect(app.state.calls.some(call => call.table === 'profiles')).toBe(true);
    await expect(page).toHaveURL(role === 'parent' ? /\/familias/ : role === 'teacher' ? /\/docentes/ : role === 'superadmin' ? /\/privado\// : /\/login/);
    await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
    expect(app.state.calls.filter(call => call.table === 'student_transport_enrollments' || call.table === 'student_sport_enrollments')).toHaveLength(0);
  });
}

for (const mode of ['anonymous', 'demo', 'inactive', 'suspended']) {
  test(`A04/A05: ${mode} state grants no student access`, async ({ app, page }) => {
    if (mode === 'inactive') app.state.active = false;
    else if (mode === 'suspended') app.state.status = 'suspended';
    else {
      app.state.authenticated = false;
      await page.addInitScript(key => {
        localStorage.removeItem(key);
        localStorage.setItem('educar_auth_session', JSON.stringify({ role: 'student', authSource: 'local', name: 'Forged Student', token: 'local-demo' }));
      }, sessionKey);
    }
    await app.visit(); await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  });
}

test('A03: pending authentication never flashes student chatbot', async ({ app, page }) => {
  app.state.authDelay = true; await page.goto('/alumnos', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status', { name: 'Cargando portal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  app.state.authDelay = false; app.state.authPending.splice(0).forEach(resolve => resolve());
  await expect(page.getByText('Portal del alumno', { exact: true })).toBeVisible({ timeout: 10000 });
});
