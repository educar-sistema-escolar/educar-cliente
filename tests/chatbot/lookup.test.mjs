import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { serviceRows, profileId, personId, studentId } from './fixtures.mjs';

async function rig(options = {}) {
  const state = {
    userId: profileId, user: true, session: true, role: 'student', active: true, status: 'active', profileMissing: false,
    authError: null, sessionError: null, errors: {}, throwTable: '', deferredTable: '',
    rows: { people: [{ id: personId, profile_id: profileId, is_active: true }], students: [{ id: studentId, person_id: personId, is_active: true }], ...serviceRows() },
    ...options,
  };
  const calls = [];
  let release = () => {};
  const waiting = new Promise(resolve => { release = () => resolve(undefined); });
  let started = () => {};
  const queryStarted = new Promise(resolve => { started = () => resolve(undefined); });
  const client = {
    auth: {
      async getUser() { calls.push({ table: 'auth.getUser' }); return { data: { user: state.user ? { id: state.userId } : null }, error: state.authError }; },
      async getSession() { return { data: { session: state.session ? { access_token: 'synthetic-test-token' } : null }, error: state.sessionError }; },
    },
    from(table) {
      const filters = []; let fields = ''; let signal;
      const query = {
        select(value) { fields = value; return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        order() { return query; },
        abortSignal(value) { signal = value; return query; },
        maybeSingle() { return run(true); },
        then(resolve, reject) { return run(false).then(resolve, reject); },
      };
      async function run(single) {
        calls.push({ table, fields, filters: [...filters], signal });
        const rows = table === 'profiles' ? state.profileMissing ? [] : [{ id: state.userId, email: 'student@example.test', full_name: 'Ana Prueba', role: state.role, is_active: state.active, account_status: state.status }] : state.rows[table];
        assert.ok(rows, `Unexpected table ${table}; only auth, identity and own topic reads are allowed`);
        const data = structuredClone(rows.filter(row => filters.every(([key, value]) => row[key] === value)));
        if (table === state.deferredTable) { started(); await waiting; }
        if (state.throwTable === table) throw new Error('Synthetic private network detail');
        if (state.errors[table]) return { data: null, error: state.errors[table] };
        if (single && data.length > 1) return { data: null, error: { code: 'PGRST116', message: 'Ambiguous synthetic rows' } };
        return { data: single ? data[0] ?? null : data, error: null };
      }
      return query;
    },
  };
  const context = vm.createContext({ client, setTimeout, clearTimeout });
  const modules = new Map();
  const boundary = new vm.SourceTextModule('export const supabase = client; export function requireSupabase() { return client; }', { context });
  function source(path) {
    if (path.endsWith('supabaseClient.ts')) return boundary;
    if (!modules.has(path)) modules.set(path, new vm.SourceTextModule(ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText, { context, identifier: path }));
    return modules.get(path);
  }
  const module = source(resolve('src/features/chatbot/chatbotRepository.ts'));
  await module.link((specifier, referencing) => source(resolve(dirname(referencing.identifier), `${specifier}.ts`)));
  await module.evaluate();
  /** @param {unknown} topic */
  function lookup(topic = 'transport', signal = new AbortController().signal) {
    return Reflect.get(module.namespace, 'lookupStudentChatbotServices')(topic, signal);
  }
  const legacySession = () => Reflect.get(modules.get(resolve('src/features/auth/services/supabaseAuth.ts')).namespace, 'getSupabaseAccountSession')();
  return { state, calls, started: queryStarted, release, lookup, legacySession };
}

const rejectCode = (promise, code) => assert.rejects(promise, error => {
  assert.ok(error !== null && typeof error === 'object');
  assert.equal(Reflect.get(error, 'code'), code);
  assert.doesNotMatch(String(Reflect.get(error, 'message')), /synthetic-test-token|private network|Ambiguous synthetic/); return true;
});

for (const [topic, table, marker] of [['transport', 'student_transport_enrollments', 'Recorrido Norte'], ['sports', 'student_sport_enrollments', 'Vóley']]) {
  test(`Lookup: ${topic} validates real auth and reads only its active student assignments`, async () => {
    const app = await rig(); const controller = new AbortController();
    const result = await app.lookup(topic, controller.signal);
    assert.equal(result.topic, topic); assert.equal(result.items.length, 2);
    assert.ok(JSON.stringify(result).includes(marker));
    const read = app.calls.find(call => call.table === table);
    assert.deepEqual(read.filters, [['student_id', studentId], ['is_active', true]]);
    assert.equal(read.signal, controller.signal);
    assert.equal(app.calls.filter(call => call.table.startsWith('student_')).length, 1);
    assert.ok(app.calls.filter(call => call.table === 'auth.getUser').length >= 2, 'Session is server-validated again before returning data');
    assert.ok(app.calls.filter(call => call.table === 'profiles').every(call => call.filters.some(([key, value]) => key === 'id' && value === profileId)));
    assert.ok(app.calls.filter(call => call.table === 'people').every(call => call.filters.some(([key, value]) => key === 'profile_id' && value === profileId) && call.filters.some(([key, value]) => key === 'is_active' && value === true)));
    if (topic === 'transport') {
      assert.match(read.fields, /route_number/); assert.equal(result.items[0].routeNumber, 7);
      assert.deepEqual(Array.from(result.items, row => row.academicYear), [2026, 2025]);
    } else { assert.equal(result.items[0].group, 'Grupo A'); assert.equal(result.items[1].sport, 'Natación'); }
  });
  test(`Lookup: ${topic} successful no assignments is genuinely empty`, async () => {
    const app = await rig(); app.state.rows[table] = []; assert.equal((await app.lookup(topic)).items.length, 0);
  });
  for (const shape of ['array', 'null', 'empty']) {
    test(`Lookup: ${topic} normalizes ${shape} joins`, async () => {
      const app = await rig();
      for (const row of app.state.rows[table]) for (const key of topic === 'transport' ? ['route', 'stop'] : ['sport_group']) {
        if (shape === 'array' && key === 'sport_group') row[key].sport = [row[key].sport];
        row[key] = shape === 'array' ? [row[key]] : shape === 'null' ? null : [];
      }
      const rows = (await app.lookup(topic)).items;
      assert.equal(rows[0][topic === 'transport' ? 'routeName' : 'sport'], shape === 'array' ? marker : null);
    });
  }
}

for (const [name, change, code] of [
  ['missing user', { user: false }, 'SESSION_REQUIRED'], ['missing session', { session: false }, 'SESSION_REQUIRED'],
  ['SDK missing session', { sessionError: { name: 'AuthSessionMissingError' } }, 'SESSION_REQUIRED'],
  ['invalid token', { authError: { name: 'AuthApiError', status: 401 } }, 'SESSION_REQUIRED'],
  ['missing profile', { profileMissing: true }, 'SESSION_REQUIRED'], ['inactive profile', { active: false }, 'SESSION_REQUIRED'],
  ['suspended profile', { status: 'suspended' }, 'SESSION_REQUIRED'], ['unknown role', { role: 'unknown' }, 'SESSION_REQUIRED'],
  ['parent role', { role: 'parent' }, 'STUDENT_REQUIRED'], ['teacher role', { role: 'teacher' }, 'STUDENT_REQUIRED'],
  ['admin role', { role: 'superadmin' }, 'STUDENT_REQUIRED'],
  ['auth backend error', { authError: { name: 'AuthRetryableFetchError', status: 503 } }, 'QUERY_FAILED'],
  ['session backend error', { sessionError: { message: 'Synthetic private network detail' } }, 'QUERY_FAILED'],
]) {
  test(`Lookup: ${name} cannot read services`, async () => {
    const app = await rig(change); await rejectCode(app.lookup(), code);
    assert.equal(app.calls.filter(call => call.table.startsWith('student_')).length, 0);
  });
}

/** @type {Array<[string, (app: Awaited<ReturnType<typeof rig>>) => void, string]>} */
const linkageCases = [
  ['missing person', app => { app.state.rows.people = []; }, 'LINKAGE_REQUIRED'],
  ['inactive person', app => { app.state.rows.people[0].is_active = false; }, 'LINKAGE_REQUIRED'],
  ['missing student', app => { app.state.rows.students = []; }, 'LINKAGE_REQUIRED'],
  ['inactive student', app => { app.state.rows.students[0].is_active = false; }, 'LINKAGE_REQUIRED'],
  ['ambiguous students', app => { app.state.rows.students.push({ ...app.state.rows.students[0], id: 'other-student' }); }, 'LINKAGE_AMBIGUOUS'],
];
for (const [name, modify, code] of linkageCases) {
  test(`Lookup: ${name} differs from empty services`, async () => {
    const app = await rig(); modify(app); await rejectCode(app.lookup(), code);
    assert.equal(app.calls.filter(call => call.table.startsWith('student_')).length, 0);
  });
}

for (const table of ['profiles', 'people', 'students', 'student_transport_enrollments', 'student_sport_enrollments']) {
  for (const failure of ['sdk', 'throw']) {
    test(`Lookup: ${table} ${failure} failure never becomes empty`, async () => {
      const app = await rig();
      if (failure === 'sdk') app.state.errors[table] = { message: 'Synthetic private network detail' }; else app.state.throwTable = table;
      await rejectCode(app.lookup(table === 'student_sport_enrollments' ? 'sports' : 'transport'), 'QUERY_FAILED');
    });
  }
}

test('Lookup: route number zero is retained and null remains missing', async () => {
  const app = await rig(); app.state.rows.student_transport_enrollments[0].route.route_number = 0;
  app.state.rows.student_transport_enrollments[1].route.route_number = null;
  const { items } = await app.lookup(); assert.equal(items[0].routeNumber, 0); assert.equal(items[1].routeNumber, null);
});

test('Lookup: active sports from previous years keep their year labels', async () => {
  const app = await rig();
  app.state.rows.student_sport_enrollments.push({ ...app.state.rows.student_sport_enrollments[0], id: 'sport-2025', academic_year: 2025 });
  assert.deepEqual(Array.from((await app.lookup('sports')).items, item => item.academicYear), [2026, 2026, 2025]);
});

test('Lookup: initially aborted request performs no auth or data reads', async () => {
  const app = await rig(); const controller = new AbortController(); controller.abort();
  await rejectCode(app.lookup('transport', controller.signal), 'ABORTED'); assert.equal(app.calls.length, 0);
});

for (const mutation of ['abort', 'logout', 'account-change', 'role-change', 'profile-inactive', 'person-inactive', 'legajo-change']) {
  test(`Lookup: ${mutation} while pending never returns the old student result`, async () => {
    const app = await rig({ deferredTable: 'student_transport_enrollments' }); const controller = new AbortController();
    const result = app.lookup('transport', controller.signal); await app.started;
    if (mutation === 'abort') controller.abort();
    if (mutation === 'logout') app.state.user = false;
    if (mutation === 'account-change') app.state.userId = 'different-authenticated-profile';
    if (mutation === 'role-change') app.state.role = 'parent';
    if (mutation === 'profile-inactive') app.state.active = false;
    if (mutation === 'person-inactive') app.state.rows.people[0].is_active = false;
    if (mutation === 'legajo-change') app.state.rows.students[0].id = 'different-active-student';
    app.release();
    await rejectCode(result, mutation === 'abort' ? 'ABORTED' : mutation === 'person-inactive' ? 'LINKAGE_REQUIRED' : 'SESSION_CHANGED');
  });
}

test('Lookup: arbitrary topics, identity objects and navigation payloads are rejected before reads', async () => {
  const app = await rig();
  for (const topic of ['dining', '__proto__', { topic: 'transport', studentId: 'victim' }, null]) await rejectCode(app.lookup(topic), 'INVALID_TOPIC');
  assert.equal(app.calls.length, 0);
});

for (const boundary of ['profiles', 'auth']) {
  test(`Lookup: opt-in strict ${boundary} errors preserve legacy null-return behavior`, async () => {
    const app = await rig();
    if (boundary === 'profiles') app.state.errors.profiles = { message: 'Synthetic unavailable profile query' };
    else app.state.authError = { name: 'AuthRetryableFetchError', status: 503 };
    assert.equal(await app.legacySession(), null);
  });
}

test('Lookup: strict session-error handling does not change legacy successful session behavior', async () => {
  const app = await rig({ sessionError: { message: 'Synthetic session query error' } });
  assert.equal((await app.legacySession()).role, 'student');
});
