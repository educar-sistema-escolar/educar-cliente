import { requireSupabase } from '../../auth/services/supabaseClient';
import { one, type TeacherStudent } from './teacherUtils';

export interface TeacherAssignment {
  id: string;
  course_id: string;
  academic_year: number;
  subject: { name: string } | null;
  course: { name: string; division: string | null; level: { name: string } | null } | null;
}
export interface TeacherSchedule {
  id: string;
  course_subject_id: string | null;
  course_id: string;
  academic_year: number;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
}
function check(error: { message: string } | null) {
  if (error) throw new Error('No se pudo consultar la información docente. Intenta nuevamente.');
}
export async function loadTeacherAssignments(profileId: string): Promise<TeacherAssignment[]> {
  const client = requireSupabase();
  const person = await client.from('people').select('id').eq('profile_id', profileId).eq('is_active', true).maybeSingle();
  check(person.error);
  if (!person.data) return [];
  const teacher = await client.from('teachers').select('id').eq('person_id', person.data.id).eq('is_active', true).maybeSingle();
  check(teacher.error);
  if (!teacher.data) return [];
  const assignments = await client.from('course_subjects')
    .select('id,course_id,academic_year,subject:subjects(name),course:courses(name,division,level:educational_levels(name))')
    .eq('teacher_id', teacher.data.id).eq('is_active', true).order('academic_year', { ascending: false });
  check(assignments.error);
  return (assignments.data ?? []).map(row => {
    const course = one(row.course);
    return { ...row, subject: one(row.subject), course: course ? { ...course, level: one(course.level) } : null };
  });
}
export async function loadTeacherRoster(assignmentId: string): Promise<TeacherStudent[]> {
  const client = requireSupabase();
  const roster = await client.from('student_subject_enrollments')
    .select('id,student:students(student_number,person:people(first_name,last_name))')
    .eq('course_subject_id', assignmentId).eq('is_active', true);
  check(roster.error);
  const rows = roster.data ?? [];
  if (!rows.length) return [];
  const history = await client.from('academic_history').select('id,student_subject_enrollment_id,term,grade,notes,created_by')
    .in('student_subject_enrollment_id', rows.map(row => row.id)).order('term');
  check(history.error);
  return rows.map(row => {
    const student = one(row.student);
    return { id: row.id, student: student ? { ...student, person: one(student.person) } : null,
      history: (history.data ?? []).filter(record => record.student_subject_enrollment_id === row.id) };
  }).sort((a, b) => (a.student?.person?.last_name ?? '').localeCompare(b.student?.person?.last_name ?? '', 'es'));
}
export async function saveTeacherGrade(input: { enrollmentId: string; historyId: string | null; term: number; grade: number; notes: string }) {
  const { error } = await requireSupabase().rpc('save_teacher_grade', {
    p_enrollment_id: input.enrollmentId, p_history_id: input.historyId,
    p_term: input.term, p_grade: input.grade, p_notes: input.notes,
  });
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe una nota para este período.');
    if (error.code === '42501') throw new Error('No tenés permiso para modificar esta calificación.');
    throw new Error('No se pudo guardar la calificación. Revisá los datos e intentá nuevamente.');
  }
}
export async function loadTeacherSchedules(assignments: TeacherAssignment[]): Promise<TeacherSchedule[]> {
  if (!assignments.length) return [];
  const result = await requireSupabase().from('academic_schedules')
    .select('id,course_subject_id,course_id,academic_year,day_of_week,starts_at,ends_at')
    .in('course_id', [...new Set(assignments.map(item => item.course_id))]).eq('is_active', true)
    .order('day_of_week').order('starts_at');
  check(result.error);
  return (result.data ?? []).filter(row => assignments.some(assignment => assignment.academic_year === row.academic_year &&
    (row.course_subject_id === assignment.id || (!row.course_subject_id && row.course_id === assignment.course_id))));
}

/** Uses the institutional person record without changing authentication or profile data. */
export async function loadTeacherDisplayName(profileId: string): Promise<string | null> {
  const { data, error } = await requireSupabase().from('people').select('first_name,last_name').eq('profile_id', profileId).eq('is_active', true).maybeSingle();
  check(error);
  return data ? [data.first_name, data.last_name].filter(Boolean).join(' ') || null : null;
}
