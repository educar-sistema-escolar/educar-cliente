import { getDynamicInstitutionalStudentByDni } from '../../inscripcion/services/dynamicInstitutionalStore';
import { institutionalStudents } from '../data/institutionalStudents';
import { localDemoAccounts } from '../data/localDemoAccounts';
import { loginInstitutionalUser } from './supabaseAuth';
import type {
  AuthSession,
  DemoUserRole,
  InstitutionalStudent,
  LocalDemoAccount,
  RegisteredBackendUser,
  StudentCreationPayload,
} from '../types';

const AUTH_SESSION_KEY = 'educar_auth_session';
const ACCOUNT_STATUS_KEY = 'educar_demo_student_accounts';
const REGISTERED_USERS_KEY = 'educar_registered_backend_users';

type AccountStatusMap = Record<string, boolean>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeDni(dni: string) {
  return dni.replace(/\D/g, '');
}

function readAccountStatus(): AccountStatusMap {
  const raw = localStorage.getItem(ACCOUNT_STATUS_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as AccountStatusMap;
  } catch {
    return {};
  }
}

function writeAccountStatus(status: AccountStatusMap) {
  localStorage.setItem(ACCOUNT_STATUS_KEY, JSON.stringify(status));
}

function readRegisteredUsers() {
  const raw = localStorage.getItem(REGISTERED_USERS_KEY);

  if (!raw) {
    return [] as RegisteredBackendUser[];
  }

  try {
    return JSON.parse(raw) as RegisteredBackendUser[];
  } catch {
    return [] as RegisteredBackendUser[];
  }
}

function findRegisteredUserByEmail(email: string) {
  return readRegisteredUsers().find((item) => item.email === email) ?? null;
}

function findLocalDemoAccount(email: string): LocalDemoAccount | null {
  const account = localDemoAccounts.find(
    (item) => item.email.toLowerCase() === email,
  );

  return account ?? null;
}


export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getLocalDemoAccounts() {
  return localDemoAccounts;
}

export function getLocalDemoAccountByEmail(email: string) {
  return findLocalDemoAccount(normalizeEmail(email));
}

export function getRegisteredUsers() {
  return readRegisteredUsers();
}

export function getRegisteredUserByEmail(email: string) {
  return findRegisteredUserByEmail(normalizeEmail(email));
}

export function isStudentAccountCreated(dni: string) {
  return Boolean(readAccountStatus()[normalizeDni(dni)]);
}

export function markStudentAccountCreated(dni: string) {
  const current = readAccountStatus();
  current[normalizeDni(dni)] = true;
  writeAccountStatus(current);
}

export function getInstitutionalStudentByDni(dni: string) {
  const normalizedDni = normalizeDni(dni);

  // Check the hardcoded institutional data first
  const staticStudent = institutionalStudents.find((item) => item.dni === normalizedDni);

  if (staticStudent) {
    return {
      ...staticStudent,
      hasAccount: isStudentAccountCreated(staticStudent.dni),
    };
  }

  // INTENTIONAL: Fall back to the dynamic registry for students added through
  // the enrollment approval flow. In production, this would be a single
  // backend query instead of two separate lookups.
  const dynamicStudent = getDynamicInstitutionalStudentByDni(normalizedDni);

  if (dynamicStudent) {
    return {
      ...dynamicStudent,
      hasAccount: isStudentAccountCreated(dynamicStudent.dni),
    };
  }

  return null;
}

export async function registerInstitutionalUser(_input: {
  role: Extract<DemoUserRole, 'student' | 'teacher' | 'parent'>;
  email: string;
  dni: string;
  password: string;
}) {
  void _input;
  throw new Error('El alta de cuentas institucionales debe realizarla administración mediante Supabase Auth.');
}

export async function loginWithEmail(email: string, password: string) {
  return loginInstitutionalUser(email, password);
}

export async function createStudentAccount(
  _token: string,
  _payload: StudentCreationPayload,
) {
  void _token;
  void _payload;
  throw new Error('La creación de cuentas de alumnos debe realizarse mediante el flujo institucional de Supabase Auth.');
}

export function getDefaultStudentPayload(
  student: InstitutionalStudent,
): StudentCreationPayload {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    dni: student.dni,
    birthDate: student.birthDate,
    phoneNumbers: [],
    password: '',
    schoolYear: student.schoolYear,
    division: student.division,
    educationalLevel: student.educationalLevel,
  };
}

export function createAdminUser(_input: {
  name: string;
  email: string;
  role: DemoUserRole;
  dni: string;
}): RegisteredBackendUser {
  void _input;
  throw new Error('La creación de usuarios debe realizarse mediante la función administrativa de Supabase Auth.');
}

export function changeUserPassword(_email: string, _newPassword: string): void {
  void _email;
  void _newPassword;
  throw new Error('El cambio de contraseña debe realizarse mediante Supabase Auth.');
}

export function getRoleHomePath(role: DemoUserRole) {
  switch (role) {
    case 'superadmin':
      return '/privado/solicitudes';
    case 'teacher':
      return '/docentes';
    case 'parent':
      return '/familias';
    case 'student':
    default:
      return '/alumnos';
  }
}

export function getRoleLabel(role: DemoUserRole) {
  switch (role) {
    case 'superadmin':
      return 'Superadministrador';
    case 'teacher':
      return 'Docente';
    case 'parent':
      return 'Familia';
    case 'student':
    default:
      return 'Alumno';
  }
}

export function getRoleAreaLabel(role: DemoUserRole) {
  switch (role) {
    case 'superadmin':
      return 'Panel institucional';
    case 'teacher':
      return 'Portal docente';
    case 'parent':
      return 'Portal familias';
    case 'student':
    default:
      return 'Portal de alumnos';
  }
}
