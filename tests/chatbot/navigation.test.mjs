import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const module = new vm.SourceTextModule(ts.transpileModule(readFileSync(new URL('../../src/features/student/services/studentPortalNavigation.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText, { context: vm.createContext({}) });
await module.link(specifier => { throw new Error(`Navigation declarations must not import runtime code: ${specifier}`); });
await module.evaluate();
const destination = target => JSON.parse(JSON.stringify(Reflect.get(module.namespace, 'studentPortalDestination')(target)));
const fromHash = hash => Reflect.get(module.namespace, 'studentSectionFromHash')(hash);

for (const [section, id] of [['notes', 'student-notes'], ['schedule', 'student-schedule'], ['services', 'student-services']]) {
  test(`Navigation: ${section} maps only to its stable focus target`, () => {
    assert.deepEqual(destination({ pathname: '/alumnos', section }), { pathname: '/alumnos', hash: `#${id}` });
    assert.equal(fromHash(`#${id}`), id);
  });
}
for (const pathname of ['/alumnos/foro', '/noticias']) {
  test(`Navigation: ${pathname} is an allowlisted section-free destination`, () => assert.deepEqual(destination({ pathname }), { pathname }));
}
test('Navigation: arbitrary routes, prototype keys and unknown hashes have no destination', () => {
  for (const target of [{ pathname: '/privado' }, { pathname: 'https://evil.example' }, { pathname: '/alumnos', section: 'constructor' }, { pathname: '/alumnos', section: 'unknown' }]) assert.equal(destination(target), null);
  for (const hash of ['', '#constructor', '#arbitrary', '#student-services-extra']) assert.equal(fromHash(hash), null);
});
