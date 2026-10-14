export function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
export interface TeacherStudent {
  id: string;
  student: { student_number: string | null; person: { first_name: string; last_name: string } | null } | null;
  history: { id?: string; term: number; grade: number; notes: string | null }[];
}
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filterRoster(roster: TeacherStudent[], query: string) {
  const needle = normalize(query.trim());
  return roster.filter(row => normalize(`${row.student?.person?.first_name ?? ''} ${row.student?.person?.last_name ?? ''} ${row.student?.student_number ?? ''}`).includes(needle));
}
export function rosterCsv(roster: TeacherStudent[]) {
  function cell(value: string) {
    const safe = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return [['Estudiante', 'Legajo', 'Período', 'Nota', 'Observaciones'], ...roster.flatMap(row => {
    const name = `${row.student?.person?.last_name ?? ''}, ${row.student?.person?.first_name ?? ''}`;
    const records = row.history.length ? row.history : [{ term: '', grade: '', notes: '' }];
    return records.map(record => [name, row.student?.student_number ?? '', String(record.term), String(record.grade), record.notes ?? '']);
  })].map(row => row.map(cell).join(';')).join('\r\n');
}
