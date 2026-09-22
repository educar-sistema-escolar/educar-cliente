export type DemoUserRole = 'superadmin' | 'student' | 'parent' | 'teacher';

export type AdminAccountRole = DemoUserRole | 'guardian';

export type AuthSource = 'backend' | 'local' | 'supabase';

export interface AuthSession {
  token: string;
  role: DemoUserRole;
  email: string;
  name: string;
  authSource: AuthSource;
  mustChangePassword?: boolean;
}

export interface InstitutionalStudent {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  schoolYear: string;
  division: string;
  educationalLevel: string;
  hasAccount: boolean;
}

export interface LoginResponse {
  token: string;
}

export interface StudentCreationPayload {
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  birthDate: string;
  phoneNumbers: string[];
  password: string;
  schoolYear: string;
  division: string;
  educationalLevel: string;
}

export interface LocalDemoAccount {
  email: string;
  password: string;
  name: string;
  role: Extract<DemoUserRole, 'superadmin' | 'parent' | 'teacher'>;
  summary: string;
  avatar: string;
  highlights: string[];
  childName?: string;
  childLevel?: string;
  childCourse?: string;
  relation?: string;
  department?: string;
}

export interface RegisteredBackendUser {
  email: string;
  dni: string;
  role: DemoUserRole;
  createdAt: string;
  name: string;
  mustChangePassword?: boolean;
}
