export const profileId = '10000000-0000-4000-8000-000000000001';
export const studentId = '20000000-0000-4000-8000-000000000001';
export const personId = '30000000-0000-4000-8000-000000000001';

export function serviceRows() {
  return {
    student_transport_enrollments: [
      { id: 'transport-2026', student_id: studentId, academic_year: 2026, is_active: true, route: { name: 'Recorrido Norte', route_number: 7 }, stop: { name: 'Plaza Norte' } },
      { id: 'transport-2025', student_id: studentId, academic_year: 2025, is_active: true, route: { name: 'Recorrido Sur', route_number: 4 }, stop: { name: 'Plaza Sur' } },
      { id: 'transport-inactive', student_id: studentId, academic_year: 2024, is_active: false, route: { name: 'RECORRIDO INACTIVO', route_number: 9 }, stop: { name: 'Parada inactiva' } },
    ],
    student_sport_enrollments: [
      { id: 'sport-1', student_id: studentId, academic_year: 2026, is_active: true, sport_group: { name: 'Grupo A', sport: { name: 'Vóley' } } },
      { id: 'sport-2', student_id: studentId, academic_year: 2026, is_active: true, sport_group: { name: 'Grupo B', sport: { name: 'Natación' } } },
      { id: 'sport-inactive', student_id: studentId, academic_year: 2025, is_active: false, sport_group: { name: 'Grupo anterior', sport: { name: 'DEPORTE INACTIVO' } } },
    ],
  };
}

// This mock implements the existing repository's PostgREST boundary, not its mapper.
export function repositoryClient({ overrides = {}, errors = {} } = {}) {
  const calls = [];
  const rows = {
    people: [{ id: personId, profile_id: profileId, is_active: true }],
    students: [{ id: studentId, person_id: personId, is_active: true, student_number: 'TEST-01', person: { first_name: 'Ana', last_name: 'Prueba' } }],
    student_enrollments: [], student_subject_enrollments: [], student_dining_enrollments: [],
    ...serviceRows(), ...overrides,
  };
  const client = {
    async rpc(name) {
      if (name !== 'get_student_academic_enrollment_status') throw new Error(`Unexpected RPC: ${name}`);
      return { data: 'available', error: null };
    },
    from(table) {
      const filters = [];
      const query = {
        select() { return query; },
        eq(key, value) { filters.push(row => row[key] === value); return query; },
        in(key, values) { filters.push(row => values.includes(row[key])); return query; },
        order() { return query; },
        maybeSingle() { return result(true); },
        then(resolve, reject) { return result(false).then(resolve, reject); },
      };
      async function result(single) {
        calls.push(table);
        if (!(table in rows)) throw new Error(`Unexpected table: ${table}`);
        const data = rows[table].filter(row => filters.every(filter => filter(row)));
        return { data: single ? data[0] ?? null : data, error: errors[table] ?? null };
      }
      return query;
    },
  };
  return { client, calls };
}
