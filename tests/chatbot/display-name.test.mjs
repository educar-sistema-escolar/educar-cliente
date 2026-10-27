import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

async function displayName({ name = '', person = null, error = null, reject = false, aborted = false, role = 'student' } = {}) {
  const calls = [];
  const signal = new AbortController();
  if (aborted) signal.abort();
  const query = {
    select(value) { calls.push(['select', value]); return query; },
    eq(key, value) { calls.push([key, value]); return query; },
    abortSignal(value) { assert.equal(value, signal.signal); return query; },
    async maybeSingle() { if (reject) throw new Error('offline'); return { data: person, error }; },
  };
  const client = { from(table) { calls.push(['table', table]); return query; } };
  const context = vm.createContext({ client, setTimeout, clearTimeout });
  const boundary = new vm.SourceTextModule('export const supabase=client; export const requireSupabase=()=>client;', { context });
  const source = path => new vm.SourceTextModule(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, { context });
  const auth = source('../../src/features/auth/services/supabaseAuth.ts');
  const roles = source('../../src/features/auth/services/institutionalRole.ts');
  const timeout = source('../../src/features/auth/services/authTimeout.ts');
  await auth.link(specifier => specifier === './supabaseClient' ? boundary : specifier === './authTimeout' ? timeout : roles);
  await auth.evaluate();
  const value = await Reflect.get(auth.namespace, 'getStudentDisplayName')({ profileId: 'verified-profile', role, name }, signal.signal);
  return { value, calls };
}

test('linked active person name wins and is scoped to the validated profile', async () => {
  const result = await displayName({ name: 'old profile', person: { first_name: ' Lucía ', last_name: 'Pérez' } });
  assert.equal(result.value, 'Lucía Pérez');
  assert.deepEqual(result.calls.filter(call => ['profile_id', 'is_active'].includes(call[0])), [['profile_id', 'verified-profile'], ['is_active', true]]);
});
for (const name of ['', '   ', 'student@example.test']) {
  test(`no email or empty display-name fallback: ${JSON.stringify(name)}`, async () => {
    assert.equal((await displayName({ name })).value, '');
    assert.equal((await displayName({ name, error: { message: 'query failed' } })).value, '');
    assert.equal((await displayName({ name, reject: true })).value, '');
  });
}
test('optional failed name lookup retains a genuine validated profile name', async () => {
  assert.equal((await displayName({ name: ' Ana Prueba ', error: { message: 'offline' } })).value, 'Ana Prueba');
  assert.equal((await displayName({ name: 'Ana', person: { first_name: 'email@example.test' } })).value, 'Ana');
});
test('cancelled display lookup rejects and other roles do not read student people', async () => {
  await assert.rejects(displayName({ aborted: true }), { name: 'AbortError' });
  const result = await displayName({ name: 'Docente', role: 'teacher' });
  assert.equal(result.value, 'Docente'); assert.deepEqual(result.calls, []);
});
