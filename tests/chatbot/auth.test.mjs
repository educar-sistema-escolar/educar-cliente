import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { profileId } from './fixtures.mjs';

async function sessionFor({ role = 'student', active = true, status = 'active', user = true, session = true, authError = null } = {}) {
  const profile = { id: profileId, email: 'student@example.test', full_name: 'Ana Prueba', role, is_active: active, account_status: status };
  const client = {
    auth: {
      getUser: async () => ({ data: { user: user ? { id: profileId } : null }, error: authError }),
      getSession: async () => ({ data: { session: session ? { access_token: 'synthetic-token' } : null } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }) }) }),
  };
  const context = vm.createContext({ client });
  const boundary = new vm.SourceTextModule('export const supabase = client; export function requireSupabase() { return client; }', { context });
  function source(path) {
    return new vm.SourceTextModule(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText, { context });
  }
  const roleModule = source('../../src/features/auth/services/institutionalRole.ts');
  const auth = source('../../src/features/auth/services/supabaseAuth.ts');
  await auth.link(specifier => specifier === './supabaseClient' ? boundary : roleModule);
  await auth.evaluate();
  return Reflect.get(auth.namespace, 'getSupabaseAccountSession')();
}

test('A01: actual institutional auth identifies a verified active student', async () => {
  const session = await sessionFor();
  assert.equal(session.role, 'student');
  assert.equal(session.profileId, profileId);
  assert.equal(session.authSource, 'supabase');
});

/** @type {Array<[string, Parameters<typeof sessionFor>[0]]>} */
const rejectedSessions = [
  ['inactive profile', { active: false }], ['suspended profile', { status: 'suspended' }],
  ['unknown role', { role: 'unknown' }], ['missing user', { user: false }],
  ['missing session', { session: false }], ['invalid token', { authError: { message: 'invalid token' } }],
];
for (const [label, options] of rejectedSessions) {
  test(`A03/A05/Q13: actual auth rejects ${label}`, async () => {
    assert.equal(await sessionFor(options), null);
  });
}

for (const role of ['teacher', 'parent', 'superadmin']) {
  test(`A02: actual auth preserves ${role} identity; chatbot must reject it separately`, async () => {
    assert.equal((await sessionFor({ role })).role, role);
  });
}
