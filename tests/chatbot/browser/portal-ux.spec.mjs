import { test, expect } from './app-fixture.mjs';

test('student presentation uses the linked person name, one email and one public-site link', async ({ app, page }) => {
  app.state.name = 'student@example.test';
  await page.route('**/rest/v1/people?**', route => route.fulfill({ json: { id: 'person-test', first_name: 'Lucía', last_name: 'Pérez', is_active: true } }));
  await app.visit('/alumnos/foro');
  await expect(page.locator('.institutional-sidebar .institutional-account strong')).toHaveText('Lucía Pérez');
  await expect(page.locator('.institutional-sidebar .institutional-account').getByText('student@example.test', { exact: true })).toHaveCount(1);
  await expect(page.locator('.institutional-sidebar').getByRole('link', { name: 'Sitio institucional', exact: true })).toHaveCount(1);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Volver al sitio institucional' })).toHaveCount(0);
  await app.open();
  await expect(app.panel()).toContainText('Hola, Lucía Pérez.');
  await expect(app.panel().locator('header')).toHaveCSS('background-color', 'rgb(0, 70, 170)');
  await app.panel().focus();
  await page.keyboard.press('Tab');
  await expect(app.panel().getByRole('button', { name: 'Cerrar ayuda' })).toBeFocused();
  await expect(app.panel().getByRole('button', { name: 'Cerrar ayuda' })).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'test-results/portal-ux-desktop.png' });
  await page.setViewportSize({ width: 390, height: 760 });
  await expect(app.panel().locator('footer')).toBeInViewport();
  await page.screenshot({ path: 'test-results/portal-ux-mobile.png' });
  await app.panel().getByRole('button', { name: 'Cerrar ayuda' }).click();
  await page.getByRole('button', { name: 'Abrir menú de Alumno' }).click();
  const menu = page.getByRole('dialog', { name: 'Menú de Alumno' });
  await expect(menu.getByRole('link', { name: 'Sitio institucional', exact: true })).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
});

test('missing linked name never greets an email or duplicates it in the sidebar', async ({ app, page }) => {
  app.state.name = 'student@example.test'; app.state.linked = false;
  await app.visit(); await app.open();
  await expect(app.panel()).toContainText('Hola, estudiante.');
  await expect(app.panel()).not.toContainText('student@example.test');
  await expect(page.locator('.institutional-sidebar .institutional-account').getByText('student@example.test', { exact: true })).toHaveCount(1);
});

test('initial validation and repeated same-account events use a neutral loading shell without personal data', async ({ app, page }) => {
  app.state.authDelay = true; await page.goto('/alumnos');
  await expect(page.getByRole('status', { name: 'Cargando portal' })).toBeVisible();
  await expect(page.getByText(/Validando sesión institucional/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  app.state.authDelay = false; app.state.authPending.splice(0).forEach(resolve => resolve());
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toBeVisible({ timeout: 10000 });
  app.state.profileDelay = true; await app.changeAccount(app.state.profileId);
  await expect.poll(() => app.state.profilePending.length, { timeout: 10000 }).toBeGreaterThan(0);
  await expect(page.getByRole('status', { name: 'Cargando portal' })).toBeVisible();
  await expect(page.getByText('Ana Prueba', { exact: true })).toHaveCount(0);
  app.state.profileDelay = false; app.state.profilePending.splice(0).forEach(resolve => resolve());
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toBeVisible({ timeout: 10000 });
});

test('a late display name from the previous account cannot overwrite the current student', async ({ app, page }) => {
  let release = () => { /* Replaced by the pending request release. */ };
  let oldRequestStarted = false;
  const pending = new Promise(resolve => { release = () => resolve(undefined); });
  await page.route('**/rest/v1/people?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('select') !== 'first_name,last_name') return route.fallback();
    const oldAccount = params.get('profile_id') === `eq.${app.state.profileId}` && app.state.name === 'Ana Prueba';
    if (oldAccount) { oldRequestStarted = true; await pending; }
    return route.fulfill({ json: { first_name: oldAccount ? 'Nombre anterior' : 'Bruno', last_name: 'Vinculado' } }).catch(() => {});
  });
  try {
    await app.visit('/alumnos/foro');
    await expect.poll(() => oldRequestStarted).toBe(true);
    await app.changeAccount('10000000-0000-4000-8000-000000000002');
    await expect(page.locator('.institutional-sidebar .institutional-account strong')).toHaveText('Bruno Vinculado', { timeout: 10000 });
    release();
    await app.open();
    await expect(app.panel()).toContainText('Hola, Bruno Vinculado.');
    await expect(page.getByText('Nombre anterior Vinculado', { exact: true })).toHaveCount(0);
  } finally { release(); }
});

test('account revocation on revalidation removes personal content and returns to login', async ({ app, page }) => {
  await app.visit(); await app.open();
  app.state.active = false;
  await app.changeAccount(app.state.profileId);
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  await expect(page.getByText('Ana Prueba', { exact: true })).toHaveCount(0);
});
