import { test, expect } from './app-fixture.mjs';
import { profileId } from '../fixtures.mjs';
import { resolve } from 'node:path';

test('auth refresh immediately clears old portal and rejects a late previous identity', async ({ app, page }) => {
  const other = '10000000-0000-4000-8000-000000000002';
  await app.visit(); await app.open();
  app.state.profileDelay = true; await app.changeAccount(other);
  await expect.poll(() => app.state.profilePending.length, { timeout: 10000 }).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  await expect(page.getByText('Ana Prueba', { exact: true })).toHaveCount(0);
  app.state.profileDelay = false; await app.changeAccount(profileId);
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toBeVisible(); await app.open();
  await expect(app.panel()).toContainText('Hola, Ana Prueba.');
  const completed = page.waitForResponse(response => response.url().includes('/profiles?') && new URL(response.url()).searchParams.get('id') === `eq.${other}`);
  app.state.profilePending.splice(0).forEach(release => release());
  await (await completed).finished();
  await expect(app.panel()).toContainText('Hola, Ana Prueba.'); await expect(app.panel()).not.toContainText('Bruno Prueba');
});

for (const mobile of [false, true]) {
  test(`real portal ${mobile ? 'mobile' : 'desktop'} chatbot preview`, async ({ app, page }) => {
    await page.setViewportSize(mobile ? { width: 390, height: 760 } : { width: 1280, height: 850 });
    await app.visit(); await app.open();
    await page.screenshot({ path: resolve(`test-results/chatbot-portal-${mobile ? 'mobile' : 'desktop'}.png`) });
  });
}
