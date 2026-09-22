export type EducationalLevel = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type Course = {
  id: string;
  educational_level_id: string;
  code: string;
  name: string;
  academic_year: number;
  year_number: number | null;
  division: string | null;
  shift: 'morning' | 'afternoon' | 'full_day' | null;
  capacity: number | null;
  is_active: boolean;
  level?: EducationalLevel | null;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type CourseSubject = {
  id: string;
  course_id: string;
  subject_id: string;
  teacher_id: string | null;
  academic_year: number;
  is_active: boolean;
  subject?: Subject | null;
  teacher?: Teacher | null;
};

export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  is_active: boolean;
};

export type Teacher = {
  id: string;
  teacher_number: string | null;
  dni: string | null;
  specialty: string | null;
  is_active: boolean;
  person: Person;
};

export type StudentEnrollment = {
  id: string;
  student_id: string;
  course_id: string;
  academic_year: number;
  is_active: boolean;
  enrolled_at: string;
  course?: Course | null;
};

export type Student = {
  id: string;
  student_number: string | null;
  dni: string | null;
  is_active: boolean;
  person: Person;
  enrollments: StudentEnrollment[];
};

export type StudentSubjectEnrollment = {
  id: string;
  student_id: string;
  course_subject_id: string;
  academic_year: number;
  is_active: boolean;
  enrolled_at: string;
  student?: Pick<Student, 'id' | 'student_number'> & { person: Pick<Person, 'first_name' | 'last_name'> } | null;
  course_subject?: CourseSubject & { course?: Pick<Course, 'id' | 'name' | 'academic_year'> | null };
};

export type AcademicHistory = {
  id: string;
  student_subject_enrollment_id: string;
  term: number;
  grade: number;
  notes: string | null;
  created_at: string;
};

export type AcademicSchedule = {
  id: string;
  course_id: string;
  course_subject_id: string | null;
  academic_year: number;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  course?: Pick<Course, 'id' | 'name'> | null;
  course_subject?: Pick<CourseSubject, 'id'> & { subject?: Pick<Subject, 'name'> | null } | null;
};

export type Sport = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type SportGroup = {
  id: string;
  sport_id: string;
  name: string;
  educational_level_id: string | null;
  teacher_id: string | null;
  academic_year: number;
  capacity: number;
  is_active: boolean;
  sport?: Pick<Sport, 'id' | 'code' | 'name' | 'is_active'> | null;
  level?: Pick<EducationalLevel, 'id' | 'name'> | null;
  teacher?: Pick<Teacher, 'id'> & { person?: Pick<Person, 'first_name' | 'last_name'> | null } | null;
};

export type SportGroupSchedule = {
  id: string;
  sport_group_id: string;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

export type StudentSportEnrollment = {
  id: string;
  student_id: string;
  sport_group_id: string;
  academic_year: number;
  is_active: boolean;
  enrolled_at: string;
  student?: Pick<Student, 'id' | 'student_number'> & { person: Pick<Person, 'first_name' | 'last_name'> } | null;
  sport_group?: Pick<SportGroup, 'id' | 'name' | 'academic_year'> & { sport?: Pick<Sport, 'name'> | null } | null;
};

export type TransportRoute = {
  id: string;
  route_number: number;
  name: string;
  capacity: number;
  is_active: boolean;
  stops: TransportStop[];
};

export type TransportStop = {
  id: string;
  route_id: string;
  name: string;
  stop_order: number;
  is_active: boolean;
};

export type StudentTransportEnrollment = {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string | null;
  academic_year: number;
  is_active: boolean;
  enrolled_at: string;
  student?: Pick<Student, 'id' | 'student_number'> & { person: Pick<Person, 'first_name' | 'last_name'> } | null;
  route?: Pick<TransportRoute, 'id' | 'route_number' | 'name'> | null;
  stop?: Pick<TransportStop, 'id' | 'name'> | null;
};

export type DiningService = {
  id: string;
  code: string;
  name: string;
  capacity: number;
  is_active: boolean;
};

export type DiningSlot = {
  id: string;
  dining_service_id: string;
  service_date: string;
  capacity: number;
  is_available: boolean;
  dining_service?: Pick<DiningService, 'id' | 'name'> | null;
};

export type StudentDiningEnrollment = {
  id: string;
  student_id: string;
  dining_service_id: string;
  academic_year: number;
  is_active: boolean;
  enrolled_at: string;
  student?: Pick<Student, 'id' | 'student_number'> & { person: Pick<Person, 'first_name' | 'last_name'> } | null;
  dining_service?: Pick<DiningService, 'id' | 'code' | 'name'> | null;
};

export type DiningUsage = {
  id: string;
  dining_enrollment_id: string;
  service_date: string;
  used: boolean;
  created_at: string;
  enrollment?: Pick<StudentDiningEnrollment, 'id' | 'student_id'> & {
    student?: StudentDiningEnrollment['student'] | null;
  } | null;
};
