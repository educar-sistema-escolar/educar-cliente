export const field = 'mt-1 h-9 w-full rounded-lg border border-edu-border bg-white px-2.5 text-xs outline-none focus:border-edu-secondary';

export const studentName = (student?: { person?: { first_name: string; last_name: string } | null } | null) => student?.person ? `${student.person.first_name} ${student.person.last_name}` : 'Alumno';
