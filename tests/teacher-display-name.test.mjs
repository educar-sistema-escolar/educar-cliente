import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { test } from 'node:test';

let result = { data: { first_name: 'Ana María', last_name: 'Pérez' }, error: null };
const filters = [];
const query = { select: () => query, eq: (...args) => { filters.push(args); return query; }, maybeSingle: async () => result };
const context = vm.createContext({ client: { from: table => { assert.equal(table, 'people'); return query; } } });
const client = new vm.SourceTextModule('export function requireSupabase() { return client; }', { context });
const utils = new vm.SourceTextModule('export function one(value) { return Array.isArray(value) ? value[0] : value; }', { context });
const source = readFileSync(new URL('../src/features/teacher/services/teacherRepository.ts', import.meta.url), 'utf8');
const repository = new vm.SourceTextModule(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, { context });
await repository.link(name => name.includes('supabaseClient') ? client : utils);
await repository.evaluate();

test('teacher display name reads the active institutional person without changing authentication', async () => {
  assert.equal(await repository.namespace.loadTeacherDisplayName('profile-1'), 'Ana María Pérez');
  assert.deepEqual(filters, [['profile_id', 'profile-1'], ['is_active', true]]);
  result = { data: null, error: null };
  assert.equal(await repository.namespace.loadTeacherDisplayName('profile-1'), null);
  result = { data: null, error: { message: 'Unavailable' } };
  await assert.rejects(repository.namespace.loadTeacherDisplayName('profile-1'), /consultar/);
});
