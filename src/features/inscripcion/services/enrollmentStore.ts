import { requireSupabase } from '../../auth/services/supabaseClient';
import type {
  EnrollmentRequest,
  EnrollmentRequestInput,
  EnrollmentStatus,
} from '../types';

type EnrollmentRequestRow = {
  id: string;
  student_first_name: string;
  student_last_name: string;
  student_dni: string;
  birth_date: string;
  educational_level: string;
  school_year: string;
  turn: string;
  academic_year: number;
  responsible_full_name: string;
  responsible_dni: string;
  responsible_relation: string;
  phone: string;
  email: string;
  notes: string;
  status: EnrollmentStatus;
  source: 'public-form';
  approved_course_id: string | null;
  student_id: string | null;
  enrollment_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

function repositoryError(message: string): Error {
  return new Error(`No se pudo completar la operación de inscripción: ${message}`);
}

function mapRequest(row: EnrollmentRequestRow): EnrollmentRequest {
  return {
    id: row.id,
    studentFirstName: row.student_first_name,
    studentLastName: row.student_last_name,
    studentDni: row.student_dni,
    birthDate: row.birth_date,
    educationalLevel: row.educational_level,
    schoolYear: row.school_year,
    turn: row.turn,
    academicYear: row.academic_year,
    responsibleFullName: row.responsible_full_name,
    responsibleDni: row.responsible_dni,
    responsibleRelation: row.responsible_relation,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    status: row.status,
    source: row.source,
    approvedCourseId: row.approved_course_id,
    studentId: row.student_id,
    enrollmentId: row.enrollment_id,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDni(dni: string) {
  return dni.replace(/\D/g, '');
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function hasNumber(value: string) {
  return /\d/.test(value);
}

function notifyEnrollmentUpdated() {
  window.dispatchEvent(new Event('enrollment-updated'));
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

export async function listEnrollmentRequests(
  status?: EnrollmentStatus,
): Promise<EnrollmentRequest[]> {
  const { data, error } = await requireSupabase().rpc('list_enrollment_requests', {
    p_status: status ?? null,
  });

  if (error) throw repositoryError(error.message);
  return ((data ?? []) as EnrollmentRequestRow[]).map(mapRequest);
}

export async function getEnrollmentStatusCount(status: EnrollmentStatus) {
  return (await listEnrollmentRequests(status)).length;
}

export async function createEnrollmentRequest(input: EnrollmentRequestInput) {
  const normalized = validateEnrollmentInput(input);
  const { data, error } = await requireSupabase().rpc('submit_enrollment_request', {
    p_payload: {
      studentFirstName: normalized.studentFirstName,
      studentLastName: normalized.studentLastName,
      studentDni: normalized.studentDni,
      birthDate: normalized.birthDate,
      educationalLevel: normalized.educationalLevel,
      schoolYear: normalized.schoolYear,
      turn: normalized.turn,
      academicYear: new Date().getFullYear(),
      responsibleFullName: normalized.responsibleFullName,
      responsibleDni: normalized.responsibleDni,
      responsibleRelation: normalized.responsibleRelation,
      phone: normalized.phone,
      email: normalized.email,
      notes: normalized.notes,
    },
  });

  if (error) throw repositoryError(error.message);
  if (!data) throw repositoryError('el servidor no devolvió la solicitud creada');
  const request = mapRequest(data as EnrollmentRequestRow);
  notifyEnrollmentUpdated();
  return request;
}

export async function approveEnrollmentRequest(requestId: string, courseId: string) {
  const { data, error } = await requireSupabase().rpc('approve_enrollment_request', {
    p_request_id: requestId,
    p_course_id: courseId,
  });

  if (error) throw repositoryError(error.message);
  notifyEnrollmentUpdated();
  return data as { id: string; status: EnrollmentStatus };
}

export async function rejectEnrollmentRequest(requestId: string, reason?: string) {
  const { data, error } = await requireSupabase().rpc('reject_enrollment_request', {
    p_request_id: requestId,
    p_reason: reason ?? null,
  });

  if (error) throw repositoryError(error.message);
  notifyEnrollmentUpdated();
  return data as { id: string; status: EnrollmentStatus };
}

export async function archiveEnrollmentRequest(requestId: string) {
  const { data, error } = await requireSupabase().rpc('archive_enrollment_request', {
    p_request_id: requestId,
  });

  if (error) throw repositoryError(error.message);
  notifyEnrollmentUpdated();
  return data as { id: string; status: EnrollmentStatus };
}

// The old demo registration screen has no Stage 2 server status to update.
export function markEnrollmentAccountCreatedByDni(_dni: string) {
  void _dni;
  return null;
}
