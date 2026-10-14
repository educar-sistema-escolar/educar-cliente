import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveInstitutionalRole } from '../src/features/auth/services/institutionalRole.ts';

assert.equal(resolveInstitutionalRole('teacher'), 'teacher');
assert.equal(resolveInstitutionalRole('guardian'), 'parent');
assert.equal(resolveInstitutionalRole('superadmin'), 'superadmin');
assert.equal(resolveInstitutionalRole('admin'), null);
assert.equal(resolveInstitutionalRole('unknown'), null);
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
assert.match(app, /SupabasePortalRoute allowedRoles=\{\['teacher'\]\}/);
assert.match(app, /sessionState\.session\.role !== 'superadmin'/);
const auth = readFileSync(new URL('../src/features/auth/services/supabaseAuth.ts', import.meta.url), 'utf8');
assert.match(auth, /resolveInstitutionalRole\(profile\.role\)/);
console.log('Teacher institutional access checks passed.');
