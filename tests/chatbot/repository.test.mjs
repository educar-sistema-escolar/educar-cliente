import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { profileId, repositoryClient, serviceRows } from './fixtures.mjs';

async function loadRepository(options) {
  const { client, calls } = repositoryClient(options);
  const context = vm.createContext({ client });
  const boundary = new vm.SourceTextModule('export function requireSupabase() { return client; }', { context });
  const source = readFileSync(new URL('../../src/features/student/services/studentPortalRepository.ts', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText, { context });
  await module.link(specifier => {
    assert.equal(specifier, '../../auth/services/supabaseClient');
    return boundary;
  });
  await module.evaluate();
  return { load: () => Reflect.get(module.namespace, 'loadStudentPortal')(profileId, 'student'), calls };
}

test('D01/D02/D04/D08/D09: actual mapper preserves active assignments across valid cycles', async () => {
  const { load } = await loadRepository();
  const [student] = await load();
  assert.equal(student.services.length, 4);
  assert.equal(student.services.filter(row => row.kind === 'Transporte').length, 2);
  assert.deepEqual(Array.from(student.services.filter(row => row.kind === 'Transporte'), row => row.academicYear), [2026, 2025]);
  assert.equal(student.services.find(row => row.name === 'Vóley').detail, 'Grupo A');
  assert.ok(student.services.every(row => !row.name.includes('INACTIVO')));
});

test('D03: actual transport mapping preserves the selected route number', async () => {
  const { load } = await loadRepository();
  const [student] = await load();
  const transport = student.services.find(row => row.id === 'transport-2026');
  // Either an explicit field or a combined display name preserves the required information.
  assert.ok(transport.routeNumber === 7 || /\b7\b/.test(transport.name), 'Route 7 is selected from Supabase but lost by the current mapper');
});

for (const shape of ['array', 'null', 'empty']) {
  test(`D05/D06: actual mapper safely handles ${shape} joins`, async () => {
    const rows = serviceRows();
    for (const transport of rows.student_transport_enrollments) {
      Reflect.set(transport, 'route', shape === 'array' ? [transport.route] : shape === 'null' ? null : []);
      Reflect.set(transport, 'stop', shape === 'array' ? [transport.stop] : shape === 'null' ? null : []);
    }
    for (const sport of rows.student_sport_enrollments) {
      Reflect.set(sport, 'sport_group', shape === 'array' ? [{ ...sport.sport_group, sport: [sport.sport_group.sport] }] : shape === 'null' ? null : []);
    }
    const { load } = await loadRepository({ overrides: rows });
    const [student] = await load();
    assert.equal(student.services.length, 4);
    assert.ok(student.services.every(row => typeof row.name === 'string'));
    assert.equal(student.services[0].detail, shape === 'array' ? 'Grupo A' : null);
  });
}

test('D07: successful empty services remain an empty collection', async () => {
  const { load } = await loadRepository({ overrides: { student_sport_enrollments: [], student_transport_enrollments: [] } });
  assert.equal((await load())[0].services.length, 0);
});

test('D10: absent linked person yields no students, not fabricated services', async () => {
  const { load, calls } = await loadRepository({ overrides: { people: [] } });
  assert.equal((await load()).length, 0);
  assert.deepEqual(calls, ['people']);
});

for (const table of ['people', 'students', 'student_sport_enrollments', 'student_transport_enrollments']) {
  test(`Q05/Q06: ${table} errors reject instead of returning empty data`, async () => {
    const { load } = await loadRepository({ errors: { [table]: { message: 'Synthetic unavailable service' } } });
    await assert.rejects(load, /Synthetic unavailable service/);
  });
}

test('Q14: existing read repository never requires a mutation method', async () => {
  const { load, calls } = await loadRepository();
  await load();
  assert.ok(calls.includes('student_transport_enrollments'));
  assert.ok(calls.includes('student_sport_enrollments'));
});
