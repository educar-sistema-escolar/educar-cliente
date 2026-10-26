import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const panel = page => page.getByRole('dialog', { name: 'Ayuda', exact: true });
const choose = (page, name) => panel(page).getByRole('button', { name, exact: true }).click();
const control = (page, action, value) => page.evaluate(({ action, value }) => Reflect.get(window, 'componentTest')[action](value), { action, value });
const open = async page => { await page.getByRole('button', { name: 'Ayuda', exact: true }).click(); await expect(panel(page)).toBeVisible(); };
const lookup = async (page, topic = 'Transporte') => { await open(page); await choose(page, topic); await choose(page, topic === 'Transporte' ? 'Ver mi transporte' : 'Ver mis deportes'); };

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/chatbot/component/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Portal del alumno' })).toBeVisible();
});

test('component opens an accessible button-only panel and resets after closing', async ({ page }) => {
  await open(page); await expect(panel(page)).toContainText('Hola, Ana Prueba.');
  await expect(panel(page).locator('input,textarea')).toHaveCount(0);
  for (const topic of ['Transporte', 'Deportes', 'Encontrar una sección']) {
    await choose(page, topic); await choose(page, 'Volver'); await expect(panel(page)).toContainText('Hola, Ana Prueba.');
  }
  await choose(page, 'Transporte'); await choose(page, 'Cerrar'); await open(page);
  await expect(panel(page)).toContainText('Hola, Ana Prueba.');
});

for (const topic of ['Transporte', 'Deportes']) {
  test(`component ${topic} renders own results only and missing fields safely`, async ({ page }) => {
    await lookup(page, topic); await expect(panel(page)).toContainText(topic === 'Transporte' ? 'Recorrido Norte' : 'Vóley');
    await expect(panel(page)).toContainText('2026');
    await expect(panel(page)).not.toContainText(topic === 'Transporte' ? 'Vóley' : 'Plaza Norte');
    expect(await page.evaluate(() => Reflect.get(window, 'componentTest').calls.map(call => call.topic))).toEqual([topic === 'Transporte' ? 'transport' : 'sports']);
    await choose(page, 'Inicio');
    await control(page, 'result', { topic: topic === 'Transporte' ? 'transport' : 'sports', items: [{ id: 'missing' }] });
    await choose(page, topic); await choose(page, topic === 'Transporte' ? 'Ver mi transporte' : 'Ver mis deportes');
    await expect(panel(page)).toContainText('No informado'); await expect(panel(page)).not.toContainText(/undefined|null/);
  });
  test(`component ${topic} distinguishes empty from error and retries the same lookup`, async ({ page }) => {
    await control(page, 'mode', 'empty'); await lookup(page, topic);
    await expect(panel(page)).toContainText(topic === 'Transporte' ? 'No tienes un transporte asignado registrado.' : 'No tienes inscripciones deportivas registradas.');
    await choose(page, 'Inicio'); await control(page, 'mode', 'error'); await choose(page, topic);
    await choose(page, topic === 'Transporte' ? 'Ver mi transporte' : 'Ver mis deportes');
    await expect(panel(page).getByRole('alert')).toContainText('No pudimos consultar tu información. Inténtalo nuevamente.');
    await expect(panel(page)).not.toContainText('Synthetic internal secret');
    await control(page, 'mode', 'success'); await choose(page, 'Reintentar');
    await expect(panel(page)).toContainText(topic === 'Transporte' ? 'Recorrido Norte' : 'Vóley');
  });
}

test('component loading announces and synchronously deduplicates rapid requests', async ({ page }) => {
  await control(page, 'mode', 'pending'); await open(page); await choose(page, 'Transporte');
  await panel(page).getByRole('button', { name: 'Ver mi transporte', exact: true }).dblclick();
  await expect(panel(page).getByRole('status')).toContainText('Consultando tu información…');
  expect(await page.evaluate(() => Reflect.get(window, 'componentTest').calls.length)).toBe(1);
  for (const name of ['Inicio', 'Volver', 'Cerrar']) await expect(panel(page).getByRole('button', { name, exact: true })).toBeEnabled();
  await control(page, 'release', 'transport'); await expect(panel(page)).toContainText('Recorrido Norte');
});

for (const action of ['Inicio', 'Volver', 'Cerrar', 'Escape', 'unmount', 'account']) {
  test(`component discards delayed results after ${action}`, async ({ page }) => {
    await control(page, 'mode', 'pending'); await lookup(page);
    await expect(panel(page).getByRole('status')).toContainText('Consultando tu información…');
    if (action === 'unmount') await control(page, 'mount', false);
    else if (action === 'account') await control(page, 'account', 'B');
    else if (action === 'Escape') await page.keyboard.press('Escape');
    else await choose(page, action);
    await control(page, 'release', 'transport');
    // The fixture resolves the actual callback promise even when its AbortSignal was ignored.
    expect(await page.evaluate(() => Reflect.get(window, 'componentTest').calls[0].aborted)).toBe(true);
    if (action === 'unmount') await control(page, 'mount', true);
    if (['Cerrar', 'Escape', 'unmount', 'account'].includes(action)) await open(page);
    await expect(panel(page)).not.toContainText(/Recorrido Norte|Plaza Norte/);
    if (action === 'account') { await expect(panel(page)).toContainText('Hola, Bruno Prueba.'); await expect(panel(page)).not.toContainText('Ana Prueba'); }
    else await expect(panel(page)).toContainText(action === 'Volver' ? '¿Qué quieres consultar sobre transporte?' : 'Hola, Ana Prueba.');
  });
}

test('component overlapping topics retain the new sports result', async ({ page }) => {
  await control(page, 'mode', 'pending'); await lookup(page); await choose(page, 'Inicio');
  await control(page, 'mode', 'success'); await choose(page, 'Deportes'); await choose(page, 'Ver mis deportes');
  await expect(panel(page)).toContainText('Vóley'); await control(page, 'release', 'transport');
  await expect(panel(page)).toContainText('Vóley'); await expect(panel(page)).not.toContainText('Recorrido Norte');
});

test('component navigation closes before invoking its callback and never performs navigation itself', async ({ page }) => {
  await open(page); await choose(page, 'Encontrar una sección'); await choose(page, 'Mis servicios');
  await expect(panel(page)).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'componentTest').navigations)).toEqual([{ target: { pathname: '/alumnos', section: 'services', heading: 'Servicios activos' }, panelClosed: true }]);
  await expect(page).toHaveURL(/\/tests\/chatbot\/component\//);
});

test('component renders untrusted service strings as text', async ({ page }) => {
  const text = '<img src=x onerror="window.attack=1">';
  await control(page, 'result', { topic: 'transport', items: [{ id: 'xss', routeName: text }] });
  await lookup(page); await expect(panel(page)).toContainText(text); await expect(panel(page).locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'attack'))).toBeUndefined();
});

test('component keyboard focus and nonmodal Escape restore launcher', async ({ page }) => {
  const launcher = page.getByRole('button', { name: 'Ayuda', exact: true }); await launcher.focus(); await page.keyboard.press('Enter');
  await expect(panel(page)).toBeFocused(); await expect(launcher).toHaveAttribute('aria-expanded', 'true');
  await expect(panel(page)).not.toHaveAttribute('aria-modal', 'true');
  await page.keyboard.press('Tab'); await expect(panel(page).getByRole('button').first()).toBeFocused();
  await page.keyboard.press('Escape'); await expect(panel(page)).toHaveCount(0); await expect(launcher).toBeFocused();
});

for (const mobile of [false, true]) {
  test(`component ${mobile ? 'mobile' : 'desktop'} layout and preview`, async ({ page }) => {
    await page.setViewportSize(mobile ? { width: 390, height: 600 } : { width: 1280, height: 800 });
    await control(page, 'result', { topic: 'transport', items: Array.from({ length: 8 }, (_, index) => ({ id: String(index), routeName: `Recorrido ${index}`, routeNumber: index, stop: 'Una parada de nombre largo para comprobar la maquetación', academicYear: 2026 })) });
    await lookup(page); await expect(panel(page)).toContainText('Recorrido 7');
    const box = await panel(page).boundingBox(); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(mobile ? 390 : 1280);
    await expect(panel(page).getByRole('button', { name: 'Cerrar', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(`test-results/chatbot-${mobile ? 'mobile' : 'desktop'}.png`) });
  });
}
