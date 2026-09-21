import { requireSupabase } from '../../auth/services/supabaseClient';
import type {
  Course,
  CourseSubject,
  EducationalLevel,
  Person,
  Student,
  StudentEnrollment,
  Subject,
  Teacher,
} from '../types';

type Relation<T> = T | T[] | null | undefined;

function one<T>(relation: Relation<T>): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation ?? null;
}

function repositoryError(message: string): Error {
  return new Error(`No se pudo completar la operación académica: ${message}`);
}

export async function listEducationalLevels(): Promise<EducationalLevel[]> {
  const { data, error } = await requireSupabase()
    .from('educational_levels')
    .select('id, code, name, sort_order, is_active')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw repositoryError(error.message);
  return (data ?? []) as EducationalLevel[];
}

export async function createEducationalLevel(input: {
  code: string;
  name: string;
  sort_order: number;
}): Promise<EducationalLevel> {
  const { data, error } = await requireSupabase()
    .from('educational_levels')
    .insert(input)
    .select('id, code, name, sort_order, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as EducationalLevel;
}

export async function updateEducationalLevel(
  id: string,
  input: Partial<Pick<EducationalLevel, 'code' | 'name' | 'sort_order' | 'is_active'>>,
): Promise<EducationalLevel> {
  const { data, error } = await requireSupabase()
    .from('educational_levels')
    .update(input)
    .eq('id', id)
    .select('id, code, name, sort_order, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as EducationalLevel;
}

export async function listCourses(): Promise<Course[]> {
  const { data, error } = await requireSupabase()
    .from('courses')
    .select('id, educational_level_id, code, name, academic_year, year_number, division, shift, capacity, is_active, level:educational_levels(id, code, name, sort_order, is_active)')
    .order('academic_year', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw repositoryError(error.message);
  return ((data ?? []) as Array<Course & { level: Relation<EducationalLevel> }>).map((course) => ({
    ...course,
    level: one(course.level),
  }));
}

export async function createCourse(input: {
  educational_level_id: string;
  code: string;
  name: string;
  academic_year: number;
  year_number?: number | null;
  division?: string | null;
  shift?: Course['shift'];
  capacity?: number | null;
}): Promise<Course> {
  const { data, error } = await requireSupabase()
    .from('courses')
    .insert(input)
    .select('id, educational_level_id, code, name, academic_year, year_number, division, shift, capacity, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as Course;
}

export async function updateCourse(
  id: string,
  input: Partial<Pick<Course, 'educational_level_id' | 'code' | 'name' | 'academic_year' | 'year_number' | 'division' | 'shift' | 'capacity' | 'is_active'>>,
): Promise<Course> {
  const { data, error } = await requireSupabase()
    .from('courses')
    .update(input)
    .eq('id', id)
    .select('id, educational_level_id, code, name, academic_year, year_number, division, shift, capacity, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as Course;
}

export async function listSubjects(): Promise<Subject[]> {
  const { data, error } = await requireSupabase()
    .from('subjects')
    .select('id, code, name, is_active')
    .order('name', { ascending: true });

  if (error) throw repositoryError(error.message);
  return (data ?? []) as Subject[];
}

export async function createSubject(input: { code: string; name: string }): Promise<Subject> {
  const { data, error } = await requireSupabase()
    .from('subjects')
    .insert(input)
    .select('id, code, name, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as Subject;
}

export async function updateSubject(
  id: string,
  input: Partial<Pick<Subject, 'code' | 'name' | 'is_active'>>,
): Promise<Subject> {
  const { data, error } = await requireSupabase()
    .from('subjects')
    .update(input)
    .eq('id', id)
    .select('id, code, name, is_active')
    .single();

  if (error) throw repositoryError(error.message);
  return data as Subject;
}

const personSelect = 'id, first_name, last_name, email, phone, is_active';

export async function listTeachers(): Promise<Teacher[]> {
  const { data, error } = await requireSupabase()
    .from('teachers')
    .select(`id, teacher_number, is_active, person:people!inner(${personSelect})`)
    .order('created_at', { ascending: false });

  if (error) throw repositoryError(error.message);
  return ((data ?? []) as Array<Teacher & { person: Relation<Person> }>)
    .map((teacher) => ({ ...teacher, person: one(teacher.person) }))
    .filter((teacher): teacher is Teacher => teacher.person !== null);
}

export async function createTeacher(input: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  teacher_number?: string;
}): Promise<Teacher> {
  // ponytail: keep the two-step write until onboarding needs an atomic RPC transaction.
  const client = requireSupabase();
  const { data: person, error: personError } = await client
    .from('people')
    .insert({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
    })
    .select(personSelect)
    .single();

  if (personError) throw repositoryError(personError.message);

  const { data: teacher, error: teacherError } = await client
    .from('teachers')
    .insert({ person_id: (person as Person).id, teacher_number: input.teacher_number || null })
    .select(`id, teacher_number, is_active, person:people!inner(${personSelect})`)
    .single();

  if (teacherError) throw repositoryError(teacherError.message);
  const result = teacher as Teacher & { person: Relation<Person> };
  return { ...result, person: one(result.person) as Person };
}

export async function updateTeacher(
  id: string,
  input: {
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    teacher_number?: string | null;
    is_active?: boolean;
  },
): Promise<void> {
  const client = requireSupabase();
  const { data: teacher, error: teacherError } = await client
    .from('teachers')
    .select('person_id')
    .eq('id', id)
    .single();

  if (teacherError) throw repositoryError(teacherError.message);

  const personFields = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
  };
  const filteredPersonFields = Object.fromEntries(
    Object.entries(personFields).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(filteredPersonFields).length > 0) {
    const { error } = await client.from('people').update(filteredPersonFields).eq('id', teacher.person_id);
    if (error) throw repositoryError(error.message);
  }

  const teacherFields = {
    teacher_number: input.teacher_number,
    is_active: input.is_active,
  };
  const filteredTeacherFields = Object.fromEntries(
    Object.entries(teacherFields).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(filteredTeacherFields).length > 0) {
    const { error } = await client.from('teachers').update(filteredTeacherFields).eq('id', id);
    if (error) throw repositoryError(error.message);
  }
}

type StudentRow = Student & {
  person: Relation<Person>;
  enrollments: Array<StudentEnrollment & { course: Relation<Course> }>;
};

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await requireSupabase()
    .from('students')
    .select(`id, student_number, is_active, person:people!inner(${personSelect}), enrollments:student_enrollments(id, student_id, course_id, academic_year, is_active, enrolled_at, course:courses(id, educational_level_id, code, name, academic_year, year_number, division, shift, capacity, is_active))`)
    .order('created_at', { ascending: false });

  if (error) throw repositoryError(error.message);
  return (data as StudentRow[] | null ?? [])
    .map((student) => ({
      ...student,
      person: one(student.person),
      enrollments: (student.enrollments ?? []).map((enrollment) => ({
        ...enrollment,
        course: one(enrollment.course),
      })),
    }))
    .filter((student) => student.person !== null)
    .map((student) => ({
      ...student,
      person: student.person as Person,
      enrollments: student.enrollments as StudentEnrollment[],
    }));
}

export async function createStudent(input: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  student_number?: string;
}): Promise<Student> {
  // ponytail: keep the two-step write until onboarding needs an atomic RPC transaction.
  const client = requireSupabase();
  const { data: person, error: personError } = await client
    .from('people')
    .insert({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
    })
    .select(personSelect)
    .single();

  if (personError) throw repositoryError(personError.message);

  const { data: student, error: studentError } = await client
    .from('students')
    .insert({ person_id: (person as Person).id, student_number: input.student_number || null })
    .select(`id, student_number, is_active, person:people!inner(${personSelect})`)
    .single();

  if (studentError) throw repositoryError(studentError.message);
  const result = student as Student & { person: Relation<Person> };
  return { ...result, person: one(result.person) as Person, enrollments: [] };
}

export async function updateStudent(
  id: string,
  input: {
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    student_number?: string | null;
    is_active?: boolean;
  },
): Promise<void> {
  const client = requireSupabase();
  const { data: student, error: studentError } = await client
    .from('students')
    .select('person_id')
    .eq('id', id)
    .single();

  if (studentError) throw repositoryError(studentError.message);

  const personFields = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
  };
  const filteredPersonFields = Object.fromEntries(
    Object.entries(personFields).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(filteredPersonFields).length > 0) {
    const { error } = await client.from('people').update(filteredPersonFields).eq('id', student.person_id);
    if (error) throw repositoryError(error.message);
  }

  const studentFields = {
    student_number: input.student_number,
    is_active: input.is_active,
  };
  const filteredStudentFields = Object.fromEntries(
    Object.entries(studentFields).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(filteredStudentFields).length > 0) {
    const { error } = await client.from('students').update(filteredStudentFields).eq('id', id);
    if (error) throw repositoryError(error.message);
  }
}

export async function createStudentEnrollment(input: {
  student_id: string;
  course_id: string;
  academic_year: number;
}): Promise<StudentEnrollment> {
  const { data, error } = await requireSupabase()
    .from('student_enrollments')
    .insert(input)
    .select('id, student_id, course_id, academic_year, is_active, enrolled_at')
    .single();

  if (error) throw repositoryError(error.message);
  return data as StudentEnrollment;
}

export async function updateStudentEnrollment(
  id: string,
  input: Partial<Pick<StudentEnrollment, 'course_id' | 'academic_year' | 'is_active'>>,
): Promise<StudentEnrollment> {
  const { data, error } = await requireSupabase()
    .from('student_enrollments')
    .update(input)
    .eq('id', id)
    .select('id, student_id, course_id, academic_year, is_active, enrolled_at')
    .single();

  if (error) throw repositoryError(error.message);
  return data as StudentEnrollment;
}

const courseSubjectSelect = `id, course_id, subject_id, teacher_id, academic_year, is_active, subject:subjects(id, code, name, is_active), teacher:teachers(id, teacher_number, is_active, person:people!inner(${personSelect}))`;

type CourseSubjectRow = Omit<CourseSubject, 'subject' | 'teacher'> & {
  subject: Relation<Subject>;
  teacher: Relation<Teacher & { person: Relation<Person> }>;
};

function normalizeCourseSubject(row: CourseSubjectRow): CourseSubject {
  const teacher = one(row.teacher);
  return {
    ...row,
    subject: one(row.subject),
    teacher: teacher ? { ...teacher, person: one(teacher.person) as Person } : null,
  };
}

export async function listCourseSubjects(courseId: string): Promise<CourseSubject[]> {
  const { data, error } = await requireSupabase()
    .from('course_subjects')
    .select(courseSubjectSelect)
    .eq('course_id', courseId)
    .order('academic_year', { ascending: false });

  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => normalizeCourseSubject(row as CourseSubjectRow));
}

export async function createCourseSubject(input: {
  course_id: string;
  subject_id: string;
  teacher_id?: string;
  academic_year: number;
}): Promise<CourseSubject> {
  const { data, error } = await requireSupabase()
    .from('course_subjects')
    .insert({ ...input, teacher_id: input.teacher_id || null })
    .select(courseSubjectSelect)
    .single();

  if (error) throw repositoryError(error.message);
  return normalizeCourseSubject(data as CourseSubjectRow);
}
