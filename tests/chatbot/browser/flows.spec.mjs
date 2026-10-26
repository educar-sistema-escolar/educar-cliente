import { test, expect } from './app-fixture.mjs';

const topics = [
  { name: 'Transporte', view: 'Ver mi transporte', help: 'Solicitar o cambiar transporte', table: 'student_transport_enrollments', marker: 'Recorrido Norte', empty: 'No tienes un transporte asignado registrado. Para consultar cómo solicitarlo, comunícate con administración.', intro: 'Estos son los datos de tu transporte registrado:', helpText: 'Para consultar disponibilidad, solicitar transporte o cambiar tu parada, comunícate con administración. Este asistente no realiza solicitudes ni cambios.' },
  { name: 'Deportes', view: 'Ver mis deportes', help: 'Quiero inscribirme', table: 'student_sport_enrollments', marker: 'Vóley', empty: 'No tienes inscripciones deportivas registradas. Puedes consultar con administración qué actividades están disponibles.', intro: 'Estos son tus deportes registrados:', helpText: 'Consulta con administración qué deportes tienen inscripción abierta, sus requisitos y horarios. Este asistente no confirma cupos ni realiza inscripciones.' },
];
const errorText = 'No pudimos consultar tu información. Inténtalo nuevamente.';
const greeting = 'Hola, Ana Prueba. Puedo ayudarte a consultar tu transporte, tus deportes o encontrar una sección del portal. ¿Qué necesitas?';

/** @param {import('@playwright/test').Page} page @param {string} table */
function serviceCompleted(page, table) {
  const predicate = request => request.url().includes(table);
  return Promise.race([page.waitForEvent('requestfinished', { predicate }), page.waitForEvent('requestfailed', { predicate })]);
}

test('F01/F02/F03/A01/U06: personalized button-only home', async ({ app }) => {
  await app.visit(); await app.open();
  await expect(app.panel()).toContainText(greeting);
  for (const name of ['Transporte', 'Deportes', 'Encontrar una sección', 'Inicio', 'Cerrar']) await expect(app.panel().getByRole('button', { name, exact: true })).toBeVisible();
  await expect(app.panel().locator('input, textarea, [contenteditable="true"]')).toHaveCount(0);
  await expect(app.panel()).not.toContainText(/DNI|contraseña|correo electrónico/i);
});

for (const topic of topics) {
  test(`F03/F04/F06/D13: ${topic.name} guidance has exact copy and no invented promises`, async ({ app }) => {
    await app.visit(); await app.topic(topic.name);
    await expect(app.panel()).toContainText(`¿Qué quieres consultar sobre ${topic.name.toLowerCase()}?`);
    await app.choose(topic.help);
    await expect(app.panel()).toContainText(topic.helpText);
    expect(app.state.calls.filter(call => call.table === topic.table)).toHaveLength(0);
    await expect(app.panel().getByRole('button', { name: /confirmar|inscribirme ahora|guardar|solicitar ahora/i })).toHaveCount(0);
  });

  test(`F05/D01/D02/D03/D04/D08/D09/D12/Q02/Q14: ${topic.name} displays only active own service data`, async ({ app }) => {
    await app.visit(); await app.topic(topic.name); await app.choose(topic.view);
    await expect(app.panel()).toContainText(topic.intro);
    await expect(app.panel()).toContainText(topic.marker);
    await expect(app.panel()).toContainText('Ciclo lectivo');
    await expect(app.panel()).toContainText('2026');
    if (topic.name === 'Transporte') {
      for (const text of ['7', 'Plaza Norte', 'Recorrido Sur', '4', '2025']) await expect(app.panel()).toContainText(text);
      await expect(app.panel()).not.toContainText('Vóley');
    } else {
      for (const text of ['Grupo A', 'Natación', 'Grupo B']) await expect(app.panel()).toContainText(text);
      await expect(app.panel()).not.toContainText('Plaza Norte');
    }
    await expect(app.panel()).not.toContainText(/INACTIVO|Comedor|undefined|null/);
    expect(app.state.calls.some(call => call.table === topic.table)).toBe(true);
    const other = topics.find(item => item !== topic);
    expect(app.state.calls.filter(call => call.table === other.table || call.table === 'student_dining_enrollments')).toHaveLength(0);
  });

  for (const shape of ['array', 'null', 'empty']) {
    test(`D05/D06: ${topic.name} ${shape} relations render safely`, async ({ app }) => {
      await app.visit(); await app.topic(topic.name);
      for (const row of app.state.rows[topic.table]) {
        for (const field of topic.name === 'Transporte' ? ['route', 'stop'] : ['sport_group']) {
          row[field] = shape === 'array' ? [row[field]] : shape === 'null' ? null : [];
          if (shape === 'array' && field === 'sport_group') row[field][0].sport = [row[field][0].sport];
        }
      }
      await app.choose(topic.view);
      await expect(app.panel()).toContainText(shape === 'array' ? topic.marker : 'No informado');
      await expect(app.panel()).not.toContainText(/undefined|null/);
    });
  }

  test(`D07: ${topic.name} successful empty response is not an error`, async ({ app }) => {
    await app.visit(); await app.topic(topic.name); app.state.mode = 'empty'; await app.choose(topic.view);
    await expect(app.panel()).toContainText(topic.empty);
    await expect(app.panel().getByRole('button', { name: 'Ver mis servicios', exact: true })).toBeVisible();
    await expect(app.panel()).not.toContainText(errorText);
  });

  for (const mode of ['error', 'network']) {
    test(`Q05/Q06/Q07/Q08: ${topic.name} ${mode} remains recoverable and never empty`, async ({ app }) => {
      await app.visit(); await app.topic(topic.name); app.state.mode = mode; await app.choose(topic.view);
      await expect(app.panel()).toContainText(errorText);
      await expect(app.panel()).not.toContainText(topic.empty);
      await expect(app.panel()).not.toContainText('Synthetic internal error');
      await app.choose('Reintentar');
      await expect(app.panel()).toContainText(errorText);
      app.state.mode = 'success'; await app.choose('Reintentar');
      await expect(app.panel()).toContainText(topic.marker);
    });
  }

  test(`Q03/Q04/U03: ${topic.name} loading is announced and duplicate clicks do not duplicate requests`, async ({ app }) => {
    await app.visit(); await app.topic(topic.name); app.state.delay = true;
    await app.panel().getByRole('button', { name: topic.view, exact: true }).dblclick();
    await expect(app.panel().getByRole('status')).toContainText('Consultando tu información…');
    expect(app.state.calls.filter(call => call.table === topic.table)).toHaveLength(1);
    app.release(); await expect(app.panel()).toContainText(topic.marker);
  });

  for (const action of ['Inicio', 'Volver', 'Cerrar']) {
    test(`Q10/F07/F08/F09: ${topic.name} late response cannot override ${action}`, async ({ app, page }) => {
      await app.visit(); await app.topic(topic.name); app.state.delay = true; await app.choose(topic.view);
      await expect(app.panel()).toContainText('Consultando tu información…');
      const completed = serviceCompleted(page, topic.table);
      await app.choose(action); app.release(); await completed;
      if (action === 'Cerrar') await expect(app.panel()).toHaveCount(0);
      else {
        await expect(app.panel()).toContainText(action === 'Inicio' ? greeting : `¿Qué quieres consultar sobre ${topic.name.toLowerCase()}?`);
        await expect(app.panel()).not.toContainText(topic.marker);
      }
    });
  }

  for (const state of ['menu', 'guidance', 'success', 'empty', 'error', 'loading']) {
    for (const action of ['Inicio', 'Cerrar']) {
    test(`F07/F09/F10: ${topic.name}/${state}/${action} resets safely`, async ({ app }) => {
      await app.visit(); await app.topic(topic.name);
      if (state === 'guidance') await app.choose(topic.help);
      if (['success', 'empty', 'error', 'loading'].includes(state)) {
        app.state.mode = state === 'empty' || state === 'error' ? state : 'success';
        app.state.delay = state === 'loading'; await app.choose(topic.view);
        await expect(app.panel()).toContainText(state === 'empty' ? topic.empty : state === 'error' ? errorText : state === 'loading' ? 'Consultando tu información…' : topic.marker);
      }
      await app.choose(action);
      if (action === 'Inicio') { await expect(app.panel()).toContainText(greeting); await app.choose('Cerrar'); }
      app.release(); await app.open();
      await expect(app.panel()).toContainText(greeting);
      await expect(app.panel()).not.toContainText(topic.marker);
    });
    }
  }

  test(`F08: ${topic.name} detail/guidance back returns to topic then home`, async ({ app }) => {
    await app.visit(); await app.topic(topic.name); await app.choose(topic.help); await app.choose('Volver');
    await expect(app.panel().getByRole('button', { name: topic.view, exact: true })).toBeVisible();
    await app.choose(topic.view); await expect(app.panel()).toContainText(topic.marker); await app.choose('Volver');
    await expect(app.panel().getByRole('button', { name: topic.help, exact: true })).toBeVisible();
    await app.choose('Volver'); await expect(app.panel()).toContainText(greeting);
  });
  for (const mode of ['empty', 'error']) {
    test(`F08: ${topic.name}/${mode} back returns to its topic`, async ({ app }) => {
      await app.visit(); await app.topic(topic.name); app.state.mode = mode; await app.choose(topic.view);
      await expect(app.panel()).toContainText(mode === 'empty' ? topic.empty : errorText);
      await app.choose('Volver'); await expect(app.panel().getByRole('button', { name: topic.view, exact: true })).toBeVisible();
    });
  }
}

test('Q01: opening menus/guidance/sections makes no additional personal service reads', async ({ app }) => {
  await app.visit(); await app.open();
  for (const topic of topics) {
    await app.choose(topic.name); await app.choose(topic.help); await app.choose('Inicio');
  }
  await app.choose('Encontrar una sección');
  expect(app.state.calls.filter(call => call.table.startsWith('student_'))).toHaveLength(0);
});

test('Q09/Q11: failed transport does not block sports or leak its late response', async ({ app }) => {
  await app.visit(); await app.topic('Transporte'); app.state.mode = 'error'; await app.choose('Ver mi transporte');
  await expect(app.panel()).toContainText(errorText); await app.choose('Inicio');
  app.state.mode = 'success'; await app.choose('Deportes'); await app.choose('Ver mis deportes');
  await expect(app.panel()).toContainText('Vóley'); await expect(app.panel()).not.toContainText('Recorrido Norte');
});

test('Q09: failed sports does not block transport', async ({ app }) => {
  await app.visit(); await app.topic('Deportes'); app.state.mode = 'error'; await app.choose('Ver mis deportes');
  await expect(app.panel()).toContainText(errorText); await app.choose('Inicio');
  app.state.mode = 'success'; await app.choose('Transporte'); await app.choose('Ver mi transporte');
  await expect(app.panel()).toContainText('Recorrido Norte');
});

test('Q11: late transport cannot replace a newer sports result', async ({ app, page }) => {
  await app.visit(); await app.topic('Transporte'); app.state.delay = true; await app.choose('Ver mi transporte');
  await expect(app.panel()).toContainText('Consultando tu información…');
  const completed = serviceCompleted(page, 'student_transport_enrollments');
  await app.choose('Inicio'); await app.choose('Deportes');
  app.state.delay = false; await app.choose('Ver mis deportes');
  await expect(app.panel()).toContainText('Vóley'); app.release(); await completed;
  await expect(app.panel()).toContainText('Vóley'); await expect(app.panel()).not.toContainText('Recorrido Norte');
});

test('F07/F08/F09/F10: section menu supports back, home, close and reset', async ({ app }) => {
  await app.visit(); await app.topic('Encontrar una sección');
  await expect(app.panel()).toContainText('¿Qué sección quieres abrir?');
  await app.choose('Volver'); await expect(app.panel()).toContainText(greeting);
  await app.choose('Encontrar una sección'); await app.choose('Inicio'); await expect(app.panel()).toContainText(greeting);
  await app.choose('Encontrar una sección'); await app.choose('Cerrar'); await app.open(); await expect(app.panel()).toContainText(greeting);
});

test('D10/N07: missing linked student is distinct from no services and navigation remains bounded', async ({ app }) => {
  app.state.linked = false; await app.visit(); await app.topic('Transporte'); await app.choose('Ver mi transporte');
  await expect(app.panel()).toContainText(/vinculad/i);
  await expect(app.panel()).not.toContainText(topics[0].empty);
  await app.choose('Inicio'); await app.choose('Encontrar una sección'); await app.choose('Mis servicios');
  await expect(app.panel()).toHaveCount(0);
});

test('D11: service text is escaped rather than interpreted as HTML', async ({ app, page }) => {
  await app.visit(); await app.topic('Transporte');
  const malicious = '<img src=x onerror="window.__chatbotXss=1">';
  app.state.rows.student_transport_enrollments[0].route.name = malicious;
  await app.choose('Ver mi transporte'); await expect(app.panel()).toContainText(malicious);
  expect(await page.evaluate(() => Reflect.get(window, '__chatbotXss'))).toBeUndefined();
  await expect(app.panel().locator('img[src="x"]')).toHaveCount(0);
});

for (const event of ['logout', 'expired', 'account-change']) {
  test(`Q12/Q13/U06: ${event} clears previous data and pending results`, async ({ app, page }) => {
    await app.visit(); await app.topic('Transporte');
    app.state.delay = event !== 'expired'; app.state.mode = event === 'expired' ? 'error' : 'success';
    await app.choose('Ver mi transporte');
    await expect(app.panel()).toContainText(event === 'expired' ? errorText : 'Consultando tu información…');
    if (event === 'expired') { app.state.authenticated = false; await app.choose('Reintentar'); }
    else if (event === 'logout') await page.getByRole('button', { name: /cerrar sesión/i }).click();
    else await app.changeAccount('10000000-0000-4000-8000-000000000002');
    app.release();
    if (event !== 'account-change') await expect(page).toHaveURL(/\/login/);
    else {
      await app.open(); await expect(app.panel()).not.toContainText(/Ana Prueba|Recorrido Norte|Plaza Norte/);
    }
  });
}

const destinations = [
  ['Mis notas', 'Materias y calificaciones', '/alumnos'],
  ['Mis horarios', 'Horario de clases', '/alumnos'],
  ['Mis servicios', 'Servicios activos', '/alumnos'],
  ['Foro estudiantil', null, '/alumnos/foro'],
  ['Novedades', null, '/noticias'],
];
for (const origin of ['/alumnos', '/alumnos/foro']) {
  for (const [label, heading, path] of destinations) {
    test(`N01-N06: ${origin} -> ${label} closes chat and focuses exact destination`, async ({ app, page }) => {
      await app.visit(origin); await app.topic('Encontrar una sección'); await app.choose(label);
      await expect(app.panel()).toHaveCount(0);
      await expect.poll(() => new URL(page.url()).pathname).toBe(path);
      if (heading) {
        const target = page.getByRole('heading', { name: heading, exact: true });
        await expect(target).toBeInViewport();
        await expect.poll(() => target.evaluate(element => element === document.activeElement || element.closest('section, article')?.contains(document.activeElement))).toBe(true);
      }
    });
  }
}

test('N07: removed navigation target does not leave chat open or throw', async ({ app, page }) => {
  await app.visit(); await app.topic('Encontrar una sección');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('heading', { name: 'Servicios activos', exact: true }).evaluate(element => element.closest('article').remove());
  await app.choose('Mis servicios'); await expect(app.panel()).toHaveCount(0); expect(errors).toEqual([]);
});

test('U01/U02/U03: keyboard dialog focus, live region and Escape restore launcher', async ({ app, page }) => {
  await app.visit(); const launcher = page.getByRole('button', { name: 'Ayuda', exact: true });
  await expect(launcher).toBeVisible(); await launcher.focus(); await page.keyboard.press('Enter');
  await expect(app.panel()).toBeVisible(); await expect(launcher).toHaveAttribute('aria-expanded', 'true');
  expect(await app.panel().evaluate(element => element.contains(document.activeElement))).toBe(true);
  await expect(app.panel().locator('[aria-live], [role="status"]')).not.toHaveCount(0);
  const labels = await app.panel().getByRole('button').allTextContents();
  const reached = new Set();
  for (let index = 0; index < labels.length + 2; index += 1) {
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      const style = getComputedStyle(element);
      return { label: element.textContent?.trim(), visible: style.outlineStyle !== 'none' || style.boxShadow !== 'none' };
    });
    if (labels.map(label => label.trim()).includes(focus.label)) { reached.add(focus.label); expect(focus.visible).toBe(true); }
    await page.keyboard.press('Tab');
  }
  for (const label of labels) expect(reached.has(label.trim())).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Escape'); await expect(app.panel()).toHaveCount(0); await expect(launcher).toBeFocused();
});

test('U04/U05/U06: mobile panel fits, follows portal type and stores no service PII', async ({ app, page }) => {
  await page.setViewportSize({ width: 360, height: 640 }); await app.visit(); await app.topic('Transporte'); await app.choose('Ver mi transporte');
  await expect(app.panel()).toContainText('Recorrido Norte');
  const box = await app.panel().boundingBox(); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(360);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(app.panel().getByRole('button', { name: 'Cerrar', exact: true })).toBeInViewport();
  const fonts = await app.panel().evaluate(element => [getComputedStyle(element).fontFamily, getComputedStyle(document.body).fontFamily]);
  expect(fonts[0]).toBe(fonts[1]);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toMatch(/Recorrido Norte|Plaza Norte|Vóley/);
});
