/**
 * Dynamic Institutional Student Store
 *
 * INTENTIONAL: This is a frontend-only simulation for demo purposes.
 * In production, institutional student management would be handled entirely
 * by the backend (e.g., via POST /students or POST /students/addStudentsByFile).
 *
 * This store supplements the hardcoded `institutionalStudents` array,
 * enabling the enrollment approval flow to dynamically register new students
 * into the institutional base without requiring a running backend.
 *
 * Persistence: localStorage (key: educar_dynamic_institutional_students)
 */

import type { InstitutionalStudent } from '../../auth/types';
import { normalizeDni } from '../../../shared/utils/formatters';

const DYNAMIC_STUDENTS_KEY = 'educar_dynamic_institutional_students';

function readDynamicStudents(): InstitutionalStudent[] {
  const raw = localStorage.getItem(DYNAMIC_STUDENTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as InstitutionalStudent[];
  } catch {
    return [];
  }
}

function writeDynamicStudents(students: InstitutionalStudent[]): void {
  localStorage.setItem(DYNAMIC_STUDENTS_KEY, JSON.stringify(students));
}

/**
 * Adds a new student to the dynamic institutional registry.
 * Skips silently if a student with the same DNI already exists.
 *
 * INTENTIONAL: In production, this operation would be a backend call
 * (POST /students) rather than a localStorage write.
 */
export function addDynamicInstitutionalStudent(
  student: Omit<InstitutionalStudent, 'hasAccount'>,
): InstitutionalStudent {
  const dni = normalizeDni(student.dni);
  const current = readDynamicStudents();

  const existing = current.find((item) => item.dni === dni);

  if (existing) {
    return existing;
  }

  const record: InstitutionalStudent = {
    ...student,
    dni,
    hasAccount: false,
  };

  writeDynamicStudents([record, ...current]);
  return record;
}

/**
 * Looks up a student by DNI in the dynamic registry only.
 * Returns null if not found.
 */
export function getDynamicInstitutionalStudentByDni(
  dni: string,
): InstitutionalStudent | null {
  const normalized = normalizeDni(dni);
  return readDynamicStudents().find((item) => item.dni === normalized) ?? null;
}

/**
 * Returns all dynamically added institutional students.
 */
export function listDynamicInstitutionalStudents(): InstitutionalStudent[] {
  return readDynamicStudents();
}
