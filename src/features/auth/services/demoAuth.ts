import { forumStore } from '../../comunidad/services/forumStore';
import { getDynamicInstitutionalStudentByDni } from '../../inscripcion/services/dynamicInstitutionalStore';
import { institutionalStudents } from '../data/institutionalStudents';
import { localDemoAccounts } from '../data/localDemoAccounts';
import { saveLocalCredential, verifyLocalCredential } from './localCredentialsStore';
import { loginSuperadmin } from './supabaseAuth';
import type {
  AuthSession,
  DemoUserRole,
  InstitutionalStudent,
  LocalDemoAccount,
  LoginResponse,
  RegisteredBackendUser,
  StudentCreationPayload,
} from '../types';

const AUTH_SESSION_KEY = 'educar_auth_session';
const ACCOUNT_STATUS_KEY = 'educar_demo_student_accounts';
const REGISTERED_USERS_KEY = 'educar_registered_backend_users';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ADMIN_EMAIL = 'director@educar.com';

type AccountStatusMap = Record<string, boolean>;

function getEndpoint(path: string) {
  return `${API_BASE_URL}${path}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeDni(dni: string) {
  return dni.replace(/\D/g, '');
}

function formatNameFromEmail(email: string) {
  const [localPart] = email.split('@');
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
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

function writeRegisteredUsers(users: RegisteredBackendUser[]) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function saveRegisteredUser(user: RegisteredBackendUser) {
  const current = readRegisteredUsers().filter(
    (item) => item.email !== user.email && item.dni !== user.dni,
  );
  writeRegisteredUsers([user, ...current]);
}

function findRegisteredUserByEmail(email: string) {
  return readRegisteredUsers().find((item) => item.email === email) ?? null;
}

function inferBackendRole(email: string): DemoUserRole | null {
  const registeredUser = findRegisteredUserByEmail(email);

  if (registeredUser) {
    return registeredUser.role;
  }

  const student = institutionalStudents.find(
    (item) => item.email.toLowerCase() === email,
  );

  if (student) {
    return 'student';
  }

  return 'superadmin';
}

function findLocalDemoAccount(email: string): LocalDemoAccount | null {
  const account = localDemoAccounts.find(
    (item) => item.email.toLowerCase() === email,
  );

  return account ?? null;
}

function getDisplayName(email: string) {
  if (email === ADMIN_EMAIL) {
    return 'Director Demo';
  }

  const registeredUser = findRegisteredUserByEmail(email);

  if (registeredUser?.name) {
    return registeredUser.name;
  }

  const localAccount = findLocalDemoAccount(email);

  if (localAccount) {
    return localAccount.name;
  }

  const student = institutionalStudents.find(
    (item) => item.email.toLowerCase() === email,
  );

  return student ? `${student.firstName} ${student.lastName}` : formatNameFromEmail(email);
}

function syncForumProfile(student: InstitutionalStudent) {
  forumStore.updateProfile({
    name: `${student.firstName} ${student.lastName}`,
    role: `${student.educationalLevel} • ${student.schoolYear} ${student.division}`,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    reputation: 32,
    postsCount: 0,
    badgesCount: 1,
    badges: ['Nuevo'],
  });
}

function syncReadOnlyForumProfile(email: string) {
  const localAccount = findLocalDemoAccount(email);
  const registeredUser = findRegisteredUserByEmail(email);

  forumStore.updateProfile({
    name: localAccount?.name ?? getDisplayName(email),
    role:
      registeredUser?.role === 'parent'
        ? 'Acceso familiar • Lectura'
        : registeredUser?.role === 'teacher'
          ? 'Docente • Lectura'
          : 'Comunidad educativa',
    avatar:
      localAccount?.avatar ??
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    reputation: 0,
    postsCount: 0,
    badgesCount: 1,
    badges: ['Lector'],
  });
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

export async function registerInstitutionalUser(input: {
  role: Extract<DemoUserRole, 'student' | 'teacher' | 'parent'>;
  email: string;
  dni: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedDni = normalizeDni(input.dni);
  const approvedStudent =
    input.role === 'student' ? getInstitutionalStudentByDni(normalizedDni) : null;

  if (input.role === 'student' && !approvedStudent) {
    throw new Error(
      'Tu inscripción todavía no fue aprobada por la administración. Primero enviá la solicitud pública y esperá la habilitación del panel institucional.',
    );
  }

  if (input.role === 'student' && approvedStudent?.hasAccount) {
    throw new Error('Este alumno ya tiene una cuenta activa. Puede iniciar sesión directamente.');
  }

  // INTENTIONAL: Try backend registration first. If the backend is unavailable
  // (network error), proceed with local-only registration so the demo flow
  // works end-to-end. In production, remove the try/catch fallback entirely.
  try {
    const response = await fetch(getEndpoint('/users/student'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        dni: normalizedDni,
        password: input.password,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        text ||
          'No se pudo completar el registro. Verifica que el DNI exista en la base institucional.',
      );
    }
  } catch {
    // INTENTIONAL: Any fetch failure — whether a network error (backend offline),
    // a non-ok response from the Vite dev server, or an actual backend rejection —
    // falls through to local-only registration so the demo works without a backend.
    // In production, this blanket catch would be removed and errors handled properly.
  }

  const registeredUser: RegisteredBackendUser = {
    email: normalizedEmail,
    dni: normalizedDni,
    role: input.role,
    name: normalizedEmail.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  saveRegisteredUser(registeredUser);

  // INTENTIONAL: Save credentials locally so the user can log in even when the
  // backend is unavailable. See localCredentialsStore.ts for details.
  saveLocalCredential(normalizedEmail, input.password);

  if (input.role === 'student') {
    markStudentAccountCreated(normalizedDni);
  }

  return registeredUser;
}

export async function loginWithEmail(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const localAccount = findLocalDemoAccount(normalizedEmail);
  const registeredUser = findRegisteredUserByEmail(normalizedEmail);

  if (normalizedEmail === ADMIN_EMAIL || localAccount?.role === 'superadmin') {
    return loginSuperadmin(normalizedEmail, password);
  }

  // Las cuentas publicadas en el footer son siempre válidas en esta demo.
  // Se resuelven antes que los registros de localStorage para que datos viejos
  // del navegador no puedan bloquear el acceso mock.
  if (localAccount) {
    if (localAccount.password !== password) {
      throw new Error('Credenciales invalidas.');
    }

    const session: AuthSession = {
      token: `local-demo-${localAccount.role}-${btoa(localAccount.email)}`,
      role: localAccount.role,
      email: localAccount.email,
      name: localAccount.name,
      authSource: 'local',
    };

    saveSession(session);
    return session;
  }

  // INTENTIONAL: Authenticate users who registered through /registro and whose
  // credentials were saved locally. This enables the full register → login flow
  // when the backend is unavailable. In production, remove this block entirely.
  if (registeredUser && verifyLocalCredential(normalizedEmail, password)) {
    const staticStudent = institutionalStudents.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );
    const dynamicStudent = getDynamicInstitutionalStudentByDni(registeredUser.dni);
    const resolvedStudent = staticStudent ?? dynamicStudent;

    if (registeredUser.role === 'student' && resolvedStudent) {
      syncForumProfile(resolvedStudent);
    }

    if (registeredUser.role === 'parent' || registeredUser.role === 'teacher') {
      syncReadOnlyForumProfile(normalizedEmail);
    }

    const displayName = resolvedStudent
      ? `${resolvedStudent.firstName} ${resolvedStudent.lastName}`
      : getDisplayName(normalizedEmail);

    const session: AuthSession = {
      token: `local-registered-${registeredUser.role}-${btoa(registeredUser.email)}`,
      role: registeredUser.role,
      email: registeredUser.email,
      name: displayName,
      authSource: 'local',
    };

    if (registeredUser.mustChangePassword) {
      session.mustChangePassword = true;
    }

    saveSession(session);
    return session;
  }

  let response: Response;

  try {
    response = await fetch(getEndpoint('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio de autenticacion.');
  }

  if (!response.ok) {
    throw new Error('Credenciales invalidas.');
  }

  const data = (await response.json()) as LoginResponse;
  const role = inferBackendRole(normalizedEmail);

  if (!role) {
    throw new Error(
      'El usuario autentico, pero no forma parte del flujo habilitado para esta demo.',
    );
  }

  if (role === 'student') {
    const student = institutionalStudents.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (student) {
      syncForumProfile(student);
    }
  }

  if (role === 'parent' || role === 'teacher') {
    syncReadOnlyForumProfile(normalizedEmail);
  }

  const session: AuthSession = {
    token: data.token,
    role,
    email: normalizedEmail,
    name: getDisplayName(normalizedEmail),
    authSource: 'backend',
  };

  saveSession(session);
  return session;
}

export async function createStudentAccount(
  token: string,
  payload: StudentCreationPayload,
) {
  const response = await fetch(getEndpoint('/students'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'No se pudo crear la cuenta del alumno.');
  }

  markStudentAccountCreated(payload.dni);
  saveRegisteredUser({
    email: normalizeEmail(payload.email),
    dni: normalizeDni(payload.dni),
    role: 'student',
    name: `${payload.firstName} ${payload.lastName}`,
    createdAt: new Date().toISOString(),
  });
  return response.text();
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
    password: 'programacion2026',
    schoolYear: student.schoolYear,
    division: student.division,
    educationalLevel: student.educationalLevel,
  };
}

export function createAdminUser(input: {
  name: string;
  email: string;
  role: DemoUserRole;
  dni: string;
}): RegisteredBackendUser {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedDni = normalizeDni(input.dni);

  if (!normalizedDni) {
    throw new Error('El DNI es obligatorio.');
  }

  const existingRegistered = readRegisteredUsers();

  const emailExists = existingRegistered.some((u) => u.email === normalizedEmail);
  if (emailExists) {
    throw new Error('El correo electrónico ya está registrado en el sistema.');
  }

  const emailInDemo = localDemoAccounts.some(
    (a) => a.email.toLowerCase() === normalizedEmail,
  );
  if (emailInDemo) {
    throw new Error('El correo electrónico ya está registrado en el sistema.');
  }

  if (normalizedEmail === ADMIN_EMAIL) {
    throw new Error('El correo electrónico ya está registrado en el sistema.');
  }

  const emailInStudents = institutionalStudents.some(
    (s) => s.email.toLowerCase() === normalizedEmail,
  );
  if (emailInStudents) {
    throw new Error(
      'El correo electrónico pertenece a un alumno institucional. Utilice el flujo de registro de alumnos.',
    );
  }

  const dniExists = existingRegistered.some((u) => u.dni === normalizedDni);
  if (dniExists) {
    throw new Error('El DNI ya está registrado en el sistema.');
  }

  const dniInStudents = institutionalStudents.some(
    (s) => s.dni === normalizedDni,
  );
  if (dniInStudents) {
    throw new Error(
      'El DNI pertenece a un alumno institucional. Utilice el flujo de registro de alumnos.',
    );
  }

  const password = normalizedDni;

  const user: RegisteredBackendUser = {
    email: normalizedEmail,
    dni: normalizedDni,
    role: input.role,
    name: input.name,
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
  };

  saveRegisteredUser(user);
  saveLocalCredential(normalizedEmail, password);

  return user;
}

export function changeUserPassword(email: string, newPassword: string): void {
  const normalizedEmail = normalizeEmail(email);
  const users = readRegisteredUsers();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  user.mustChangePassword = false;
  writeRegisteredUsers(users);

  saveLocalCredential(normalizedEmail, newPassword);

  const session = getSession();
  if (session) {
    session.mustChangePassword = false;
    saveSession(session);
  }
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
