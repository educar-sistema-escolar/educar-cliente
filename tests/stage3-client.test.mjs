import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context = vm.createContext({ setTimeout, clearTimeout });
const load = file => new vm.SourceTextModule(ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, { context });
const timeout = load('../src/features/auth/services/authTimeout.ts');
await timeout.link(() => { throw new Error('Unexpected import'); }); await timeout.evaluate();
const csv = load('../src/features/admin/services/reportCsv.ts');
await csv.link(() => { throw new Error('Unexpected import'); }); await csv.evaluate();
const reports = load('../src/features/admin/services/reportsRepository.ts');
const client = new vm.SourceTextModule('export function requireSupabase() { throw new Error("Not used in pure filter tests"); }', { context });
await reports.link(() => client); await reports.evaluate();
test('auth initialization cannot leave the UI waiting forever and retries may succeed', async () => {
 await assert.rejects(timeout.namespace.withAuthTimeout(new Promise(() => {}), 10), /demoró demasiado/);
 assert.equal(await timeout.namespace.withAuthTimeout(Promise.resolve('ok'), 10), 'ok');
 await assert.rejects(timeout.namespace.withAuthTimeout(Promise.reject(new Error('offline')), 10), /offline/);
});
test('all twelve report families exclude unsupported filters', () => {
 assert.equal(reports.namespace.ADMIN_REPORT_DEFINITIONS.length, 12);
 const input = { academic_year: 2027, level_id: 'level', sport_id: 'sport', route_id: 'route' };
 for (const item of reports.namespace.ADMIN_REPORT_DEFINITIONS) {
  const result = reports.namespace.supportedReportFilters(item.code, input);
  assert.deepEqual(Object.keys(result), Array.from(reports.namespace.reportFilterKeys(item.code)));
 }
 assert.equal(JSON.stringify(reports.namespace.supportedReportFilters('student_overview', input)), '{}');
 assert.equal(JSON.stringify(reports.namespace.supportedReportFilters('students_by_course', input)), '{"academic_year":2027,"level_id":"level"}');
});
test('CSV preserves commas, quotes and newlines while neutralizing spreadsheet formulas', () => {
 const value = csv.namespace.reportCsv(['Nombre'], [['Apellido, Nombre'], ['Dijo "hola"'], ['línea 1\nlínea 2'], ['=SUM(A1)']]);
 assert.equal(value, '"Nombre"\r\n"Apellido, Nombre"\r\n"Dijo ""hola"""\r\n"línea 1\nlínea 2"\r\n"\'=SUM(A1)"');
});
