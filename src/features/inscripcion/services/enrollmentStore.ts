import { institutionalStudents } from '../../auth/data/institutionalStudents';
import type {
  EnrollmentRequest,
  EnrollmentRequestInput,
  EnrollmentStatus,
} from '../types';
import { addDynamicInstitutionalStudent } from './dynamicInstitutionalStore';
import { normalizeDni, normalizeEmail } from '../../../shared/utils/formatters';

const ENROLLMENT_STORAGE_KEY = 'educar_enrollment_requests';
const ACTIVE_STATUSES: EnrollmentStatus[] = [
  'pending',
  'reviewed',
  'approved_for_registration',
  'pending_admin_creation',
  'account_created',
];

function readRequests() {
  const raw = localStorage.getItem(ENROLLMENT_STORAGE_KEY);

  if (!raw) {
    return [] as EnrollmentRequest[];
  }

  try {
    return JSON.parse(raw) as EnrollmentRequest[];
  } catch {
    return [] as EnrollmentRequest[];
  }
}

function writeRequests(requests: EnrollmentRequest[]) {
  localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event('enrollment-updated'));
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function hasNumber(value: string) {
  return /\d/.test(value);
}

export function normalizeEnrollmentInput(
  input: EnrollmentRequestInput,
): EnrollmentRequestInput {
  return {
    ...input,
    studentFirstName: normalizeText(input.studentFirstName),
    studentLastName: normalizeText(input.studentLastName),
    studentDni: normalizeDni(input.studentDni),
    responsibleFullName: normalizeText(input.responsibleFullName),
    responsibleDni: normalizeDni(input.responsibleDni),
    phone: normalizeDni(input.phone),
    email: normalizeEmail(input.email),
    notes: input.notes.trim(),
  };
}

export function validateEnrollmentInput(input: EnrollmentRequestInput) {
  const normalized = normalizeEnrollmentInput(input);
  const requiredFields = [
    normalized.studentFirstName,
    normalized.studentLastName,
    normalized.studentDni,
    normalized.birthDate,
    normalized.educationalLevel,
    normalized.schoolYear,
    normalized.turn,
    normalized.responsibleFullName,
    normalized.responsibleDni,
    normalized.responsibleRelation,
    normalized.phone,
    normalized.email,
  ];

  if (requiredFields.some((item) => !item.trim())) {
    throw new Error('Completa todos los campos obligatorios antes de enviar la solicitud.');
  }

  if (
    hasNumber(normalized.studentFirstName) ||
    hasNumber(normalized.studentLastName) ||
    hasNumber(normalized.responsibleFullName)
  ) {
    throw new Error('Los nombres y apellidos no pueden contener numeros.');
  }

  if (!/^\d{7,8}$/.test(normalized.studentDni)) {
    throw new Error('El DNI del alumno debe tener entre 7 y 8 digitos.');
  }

  if (!/^\d{7,8}$/.test(normalized.responsibleDni)) {
    throw new Error('El DNI del responsable debe tener entre 7 y 8 digitos.');
  }

  if (normalized.studentDni === normalized.responsibleDni) {
    throw new Error('El DNI del alumno y del responsable no pueden ser iguales.');
  }

  if (!/^\d{8,15}$/.test(normalized.phone)) {
    throw new Error('Ingresa un telefono valido de al menos 8 digitos.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    throw new Error('Ingresa un correo valido para continuar.');
  }

  const birthDate = new Date(normalized.birthDate);
  const today = new Date();
  birthDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
    throw new Error('La fecha de nacimiento no puede ser futura.');
  }

  return normalized;
}

export function listEnrollmentRequests() {
  return readRequests().sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function createEnrollmentRequest(input: EnrollmentRequestInput) {
  const normalized = validateEnrollmentInput(input);
  const requests = readRequests();
  const duplicatedActive = requests.find(
    (item) =>
      normalizeDni(item.studentDni) === normalized.studentDni &&
      ACTIVE_STATUSES.includes(item.status),
  );

  if (duplicatedActive) {
    throw new Error(
      'Ya existe una solicitud activa para este DNI. Revisá tu correo electrónico o esperá el contacto de la institución.',
    );
  }

  const request: EnrollmentRequest = {
    ...normalized,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    source: 'public-form',
  };

  writeRequests([request, ...requests]);
  return request;
}

export function updateEnrollmentStatus(id: string, status: EnrollmentStatus) {
  const updated = readRequests().map((item) =>
    item.id === id ? { ...item, status } : item,
  );

  writeRequests(updated);
  return updated.find((item) => item.id === id) ?? null;
}

export function approveEnrollmentRequest(id: string) {
  const current = readRequests();
  const target = current.find((item) => item.id === id);

  if (!target) {
    return null;
  }

  // INTENTIONAL: When the admin approves an enrollment, the student is
  // automatically added to the dynamic institutional registry. This simulates
  // the "alta" step that in production would be handled by a backend service
  // (e.g., POST /students). The hardcoded data remains untouched.
  const alreadyInStaticBase = institutionalStudents.some(
    (student) => student.dni === normalizeDni(target.studentDni),
  );

  if (!alreadyInStaticBase) {
    addDynamicInstitutionalStudent({
      dni: normalizeDni(target.studentDni),
      firstName: target.studentFirstName,
      lastName: target.studentLastName,
      email: target.email,
      birthDate: target.birthDate,
      schoolYear: target.schoolYear,
      division: '',
      educationalLevel: target.educationalLevel,
    });
  }

  // After the dynamic addition the student always exists in some form of
  // institutional registry, so we go directly to 'approved_for_registration'.
  return updateEnrollmentStatus(id, 'approved_for_registration');
}

export function getEnrollmentStatusCount(status: EnrollmentStatus) {
  return readRequests().filter((item) => item.status === status).length;
}

export function markEnrollmentAccountCreatedByDni(dni: string) {
  const normalizedDni = normalizeDni(dni);
  const requests = readRequests();
  const target = requests.find(
    (item) =>
      normalizeDni(item.studentDni) === normalizedDni &&
      item.status !== 'archived',
  );

  if (!target) {
    return null;
  }

  return updateEnrollmentStatus(target.id, 'account_created');
}

export function updateEnrollmentRequest(id: string, input: Partial<EnrollmentRequestInput>) {
  const requests = readRequests();
  const index = requests.findIndex(item => item.id === id);

  if (index === -1) {
    return null;
  }

  requests[index] = { ...requests[index], ...input };
  writeRequests(requests);
  return requests[index];
}

export function deleteEnrollmentRequest(id: string) {
  const requests = readRequests().filter(item => item.id !== id);
  writeRequests(requests);
  return requests;
}

export function getEnrollmentRequestById(id: string) {
  return readRequests().find(item => item.id === id) ?? null;
}
