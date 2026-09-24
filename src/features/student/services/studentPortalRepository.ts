import { requireSupabase } from '../../auth/services/supabaseClient';

type Join<T> = T | T[] | null | undefined;

export interface PortalCourse {
  id: string;
  academicYear: number;
  name: string;
  yearNumber: number | null;
  division: string | null;
  shift: string | null;
  level: string | null;
}

export interface PortalSubject {
  id: string;
  name: string;
  teacher: string | null;
  grades: Array<{ term: number; grade: number; notes: string | null }>;
}

export interface PortalScheduleItem {
  id: string;
  day: number;
  startsAt: string;
  endsAt: string;
  subject: string;
}

export interface PortalService {
  id: string;
  kind: 'Deporte' | 'Transporte' | 'Comedor';
  name: string;
  detail: string | null;
  academicYear: number;
}

export interface PortalStudent {
  id: string;
  name: string;
  studentNumber: string | null;
  relationship: string | null;
  courses: PortalCourse[];
  subjects: PortalSubject[];
  schedule: PortalScheduleItem[];
  services: PortalService[];
}

interface StudentRow {
  id: string;
  student_number: string | null;
  person: Join<{ first_name: string; last_name: string }>;
}

interface CourseEnrollmentRow {
  id: string;
  academic_year: number;
  course_id: string;
  course: Join<{
    id: string;
    name: string;
    academic_year: number;
    year_number: number | null;
    division: string | null;
    shift: string | null;
    educational_level: Join<{ name: string }>;
  }>;
}

interface SubjectEnrollmentRow {
  id: string;
  course_subject: Join<{
    id: string;
    course_id: string;
    subject: Join<{ name: string }>;
    teacher: Join<{ person: Join<{ first_name: string; last_name: string }> }>;
  }>;
}

interface HistoryRow {
  student_subject_enrollment_id: string;
  term: number;
  grade: number;
  notes: string | null;
}

interface ScheduleRow {
  id: string;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  course_subject: Join<{ subject: Join<{ name: string }> }>;
}

function first<T>(value: Join<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function getStudentIds(profileId: string, role: 'student' | 'parent') {
  const supabase = requireSupabase();

  if (role === 'student') {
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();
    fail(personError);
    if (!person) return [] as Array<{ id: string; relationship: string | null }>;

    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('person_id', person.id)
      .eq('is_active', true);
    fail(error);
    return (data ?? []).map((student: { id: string }) => ({ id: student.id, relationship: null }));
  }

  const { data: links, error: linkError } = await supabase
    .from('student_guardians')
    .select('student_id,relationship_type,is_primary')
    .eq('is_active', true)
    .order('is_primary', { ascending: false });
  fail(linkError);

  const relationships = new Map<string, string>();
  for (const link of links ?? []) {
    if (!relationships.has(link.student_id)) relationships.set(link.student_id, link.relationship_type);
  }
  return [...relationships].map(([id, relationship]) => ({ id, relationship }));
}

async function loadStudent(student: StudentRow, relationship: string | null): Promise<PortalStudent> {
  const supabase = requireSupabase();
  const [coursesResult, subjectsResult, sportsResult, transportResult, diningResult] = await Promise.all([
    supabase
      .from('student_enrollments')
      .select('id,academic_year,course_id,course:courses(id,name,academic_year,year_number,division,shift,educational_level:educational_levels(name))')
      .eq('student_id', student.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false }),
    supabase
      .from('student_subject_enrollments')
      .select('id,course_subject:course_subjects(id,course_id,subject:subjects(name),teacher:teachers(person:people(first_name,last_name)))')
      .eq('student_id', student.id)
      .eq('is_active', true),
    supabase
      .from('student_sport_enrollments')
      .select('id,academic_year,sport_group:sport_groups(name,sport:sports(name))')
      .eq('student_id', student.id)
      .eq('is_active', true),
    supabase
      .from('student_transport_enrollments')
      .select('id,academic_year,route:transport_routes(name,route_number),stop:transport_stops(name)')
      .eq('student_id', student.id)
      .eq('is_active', true),
    supabase
      .from('student_dining_enrollments')
      .select('id,academic_year,dining_service:dining_services(name)')
      .eq('student_id', student.id)
      .eq('is_active', true),
  ]);

  fail(coursesResult.error);
  fail(subjectsResult.error);
  fail(sportsResult.error);
  fail(transportResult.error);
  fail(diningResult.error);

  const courseEnrollments = (coursesResult.data ?? []) as CourseEnrollmentRow[];
  const subjectEnrollments = (subjectsResult.data ?? []) as SubjectEnrollmentRow[];
  const subjectIds = subjectEnrollments.map((item) => item.id);
  const courseIds = [...new Set(courseEnrollments.map((item) => item.course_id))];
  const years = [...new Set(courseEnrollments.map((item) => item.academic_year))];

  const [historyResult, scheduleResult] = await Promise.all([
    subjectIds.length
      ? supabase
          .from('academic_history')
          .select('student_subject_enrollment_id,term,grade,notes')
          .in('student_subject_enrollment_id', subjectIds)
          .order('term')
      : Promise.resolve({ data: [], error: null }),
    courseIds.length && years.length
      ? supabase
          .from('academic_schedules')
          .select('id,day_of_week,starts_at,ends_at,course_subject:course_subjects(subject:subjects(name))')
          .in('course_id', courseIds)
          .in('academic_year', years)
          .eq('is_active', true)
          .order('day_of_week')
          .order('starts_at')
      : Promise.resolve({ data: [], error: null }),
  ]);
  fail(historyResult.error);
  fail(scheduleResult.error);

  const histories = (historyResult.data ?? []) as HistoryRow[];
  const scheduleRows = (scheduleResult.data ?? []) as ScheduleRow[];
  const subjects: PortalSubject[] = subjectEnrollments.map((item) => {
    const assignment = first(item.course_subject);
    const subject = first(assignment?.subject);
    const teacher = first(assignment?.teacher);
    const teacherPerson = first(teacher?.person);
    const name = subject?.name ?? 'Materia';
    return {
      id: item.id,
      name,
      teacher: teacherPerson ? `${teacherPerson.first_name} ${teacherPerson.last_name}` : null,
      grades: histories
        .filter((history) => history.student_subject_enrollment_id === item.id)
        .map((history) => ({ term: history.term, grade: Number(history.grade), notes: history.notes })),
    };
  });

  const person = first(student.person);
  const services: PortalService[] = [
    ...(sportsResult.data ?? []).map((row: { id: string; academic_year: number; sport_group: Join<{ name: string; sport: Join<{ name: string }> }> }) => {
      const group = first(row.sport_group);
      const sport = first(group?.sport);
      return { id: row.id, kind: 'Deporte' as const, name: sport?.name ?? 'Deporte', detail: group?.name ?? null, academicYear: row.academic_year };
    }),
    ...(transportResult.data ?? []).map((row: { id: string; academic_year: number; route: Join<{ name: string; route_number: number }>; stop: Join<{ name: string }> }) => {
      const route = first(row.route);
      const stop = first(row.stop);
      return { id: row.id, kind: 'Transporte' as const, name: route?.name ?? 'Transporte', detail: stop?.name ?? null, academicYear: row.academic_year };
    }),
    ...(diningResult.data ?? []).map((row: { id: string; academic_year: number; dining_service: Join<{ name: string }> }) => {
      const service = first(row.dining_service);
      return { id: row.id, kind: 'Comedor' as const, name: service?.name ?? 'Comedor', detail: null, academicYear: row.academic_year };
    }),
  ];

  return {
    id: student.id,
    name: person ? `${person.first_name} ${person.last_name}` : 'Alumno',
    studentNumber: student.student_number,
    relationship,
    courses: courseEnrollments.flatMap((enrollment) => {
      const course = first(enrollment.course);
      if (!course) return [];
      const level = first(course.educational_level);
      return [{
        id: course.id,
        academicYear: enrollment.academic_year,
        name: course.name,
        yearNumber: course.year_number,
        division: course.division,
        shift: course.shift,
        level: level?.name ?? null,
      }];
    }),
    subjects,
    schedule: scheduleRows.map((row) => {
      const assignment = first(row.course_subject);
      const subject = first(assignment?.subject);
      return {
        id: row.id,
        day: row.day_of_week,
        startsAt: row.starts_at.slice(0, 5),
        endsAt: row.ends_at.slice(0, 5),
        subject: subject?.name ?? 'Clase',
      };
    }),
    services,
  };
}

export async function loadStudentPortal(profileId: string, role: 'student' | 'parent') {
  const supabase = requireSupabase();
  const accessibleStudents = await getStudentIds(profileId, role);
  if (!accessibleStudents.length) return [] as PortalStudent[];

  const { data, error } = await supabase
    .from('students')
    .select('id,student_number,person:people!inner(first_name,last_name)')
    .in('id', accessibleStudents.map((student) => student.id))
    .eq('is_active', true);
  fail(error);

  const students = (data ?? []) as StudentRow[];
  return Promise.all(students.map((student) => {
    const relationship = accessibleStudents.find((item) => item.id === student.id)?.relationship ?? null;
    return loadStudent(student, relationship);
  }));
}
