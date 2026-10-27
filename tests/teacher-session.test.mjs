import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

let profile = { id: 'teacher-id', email: 'teacher@example.test', full_name: 'Teacher Test', role: 'teacher', is_active: true, account_status: 'active' };
let signedOut = false;
const client = {
  auth: {
    getUser: async () => ({ data: { user: { id: profile.id, email: profile.email } }, error: null }),
    getSession: async () => ({ data: { session: { access_token: 'test-only-token' } } }),
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => { signedOut = true; },
  },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }) }) }),
};
const context = vm.createContext({ client, setTimeout, clearTimeout });
const mock = new vm.SourceTextModule('export const supabase = client; export function requireSupabase() { return client; }', { context });
function source(path) {
  return new vm.SourceTextModule(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, { context });
}
const role = source('../src/features/auth/services/institutionalRole.ts');
const timeout = source('../src/features/auth/services/authTimeout.ts');
const auth = source('../src/features/auth/services/supabaseAuth.ts');
await auth.link(specifier => specifier === './supabaseClient' ? mock : specifier === './authTimeout' ? timeout : role);
await auth.evaluate();
assert.equal((await auth.namespace.loginInstitutionalUser('teacher@example.test', 'test-only')).role, 'teacher');
assert.equal((await auth.namespace.getSupabaseAccountSession()).profileId, 'teacher-id', 'Reload preserves institutional teacher session');
assert.equal(await auth.namespace.getSupabaseAdminSession(), null, 'Teacher cannot receive administrator session');
profile = { ...profile, is_active: false };
assert.equal(await auth.namespace.getSupabaseAccountSession(), null);
profile = { ...profile, is_active: true, account_status: 'suspended' };
assert.equal(await auth.namespace.getSupabaseAccountSession(), null);
await assert.rejects(auth.namespace.loginInstitutionalUser('teacher@example.test', 'test-only'));
assert.equal(signedOut, true, 'Rejected profiles are signed out');
console.log('Institutional teacher login, reload, admin isolation and revocation checks passed.');

profile = { ...profile, account_status: 'active' };
client.auth.getUser = async () => ({ data: { user: null }, error: { message: 'expired token' } });
assert.equal(await auth.namespace.getSupabaseAccountSession(), null, 'Expired session cannot enter a protected portal');
client.auth.getUser = async () => { throw new Error('offline'); };
assert.equal(await auth.namespace.getSupabaseAccountSession(), null, 'Transport error ends validation without an unhandled rejection');

client.auth.signInWithPassword = async () => ({ error: { name: 'AuthRetryableFetchError', status: 0 } });
await assert.rejects(auth.namespace.loginInstitutionalUser('teacher@example.test', 'test-only'), /conectar con el servidor/);
