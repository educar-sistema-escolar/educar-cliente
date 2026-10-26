import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getDemoAccessCards } from '../src/shared/utils/demoAccess.ts';

const credentials = {
  superadmin: { email: 'director@example.test', password: 'demo-password' },
  teacher: { email: 'teacher@example.test', password: 'demo-password' },
  family: { email: 'family@example.test', password: 'demo-family-password' },
  student: { email: 'student@example.test', password: 'demo-password' },
};

test('four public DEMO cards expose configured credentials without environment or verification gates', () => {
  const cards = getDemoAccessCards(credentials);
  assert.deepEqual(cards.map(({ role }) => role), ['Superadministrador', 'Docente', 'Familia', 'Estudiante']);
  assert.deepEqual(cards.map(({ id }) => id), ['superadmin', 'teacher', 'family', 'student']);
  for (const card of cards) {
    assert.equal(card.available, true);
    assert.equal(card.email, credentials[card.id].email);
    assert.equal(card.password, credentials[card.id].password);
  }
});

test('missing configuration does not invent credentials or remove the four cards', () => {
  const cards = getDemoAccessCards({ ...credentials, teacher: undefined });
  assert.equal(cards.length, 4);
  assert.equal(cards[1].available, false);
  assert.equal(cards[1].email, null);
  assert.equal(cards[1].password, null);
  assert.equal(cards[2].available, true);
  assert.equal(getDemoAccessCards({}).length, 4);
});

test('production uses public VITE credentials with no build-mode restrictions', () => {
  const source = readFileSync(new URL('../src/shared/utils/demoAccess.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /import\.meta\.env\.(DEV|PROD|MODE|VITE_DEMO_ACCESS_ENABLED|VITE_DEMO_FAMILY_VERIFIED)\b/);
  for (const role of ['SUPERADMIN', 'TEACHER', 'FAMILY', 'STUDENT']) {
    for (const field of ['EMAIL', 'PASSWORD']) assert(source.includes(`import.meta.env.VITE_DEMO_${role}_${field}`));
  }
});
