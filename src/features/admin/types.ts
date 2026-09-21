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
