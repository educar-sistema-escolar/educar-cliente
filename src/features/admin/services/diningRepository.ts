import { requireSupabase } from '../../auth/services/supabaseClient';
import type { DiningService, DiningSlot, DiningUsage, Student, StudentDiningEnrollment } from '../types';

type Relation<T> = T | T[] | null | undefined;
const one = <T>(value: Relation<T>): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;
const repositoryError = (message: string) => new Error(`No se pudo completar la operación de servicios: ${message}`);
const studentSelect = 'id,student_number,person:people!inner(first_name,last_name)';

export async function listDiningServices(): Promise<DiningService[]> {
  const { data, error } = await requireSupabase().from('dining_services').select('id,code,name,capacity,is_active').order('name');
  if (error) throw repositoryError(error.message);
  return (data ?? []) as DiningService[];
}

export async function listDiningEnrollments(): Promise<StudentDiningEnrollment[]> {
  const { data, error } = await requireSupabase().from('student_dining_enrollments')
    .select(`id,student_id,dining_service_id,academic_year,is_active,student:students(${studentSelect}),service:dining_services(id,code,name,capacity,is_active)`)
    .order('academic_year', { ascending: false }).order('enrolled_at', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as StudentDiningEnrollment & { student?: Relation<StudentDiningEnrollment['student']>; service?: Relation<DiningService> };
    return { ...item, student: one(item.student), dining_service: one(item.service) };
  });
}

export async function enrollStudentInDining(studentId: string, serviceId: string, academicYear: number): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_dining', { p_student_id: studentId, p_dining_service_id: serviceId, p_academic_year: academicYear });
  if (error) throw repositoryError(error.message);
}

export async function recordDiningUsage(input: { dining_enrollment_id: string; service_date: string; used: boolean }): Promise<void> {
  const { error } = await requireSupabase().rpc('record_dining_usage', { p_dining_enrollment_id: input.dining_enrollment_id, p_service_date: input.service_date, p_used: input.used });
  if (error) throw repositoryError(error.message);
}

export async function createDiningService(input: Pick<DiningService, 'code' | 'name' | 'capacity'>): Promise<void> {
  const { error } = await requireSupabase().from('dining_services').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateDiningService(id: string, input: Pick<DiningService, 'is_active'>): Promise<void> {
  const { error } = await requireSupabase().from('dining_services').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}

export async function listDiningSlots(): Promise<DiningSlot[]> {
  const { data, error } = await requireSupabase().from('dining_slots')
    .select('id,dining_service_id,service_date,capacity,is_available,dining_service:dining_services(id,name)')
    .order('service_date', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as DiningSlot & { dining_service?: Relation<DiningSlot['dining_service']> };
    return { ...item, dining_service: one(item.dining_service) };
  });
}

export async function createDiningSlot(input: Pick<DiningSlot, 'dining_service_id' | 'service_date' | 'capacity'>): Promise<void> {
  const { error } = await requireSupabase().from('dining_slots').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateDiningSlot(id: string, input: Partial<Pick<DiningSlot, 'capacity' | 'is_available'>>): Promise<void> {
  const { error } = await requireSupabase().from('dining_slots').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}

export async function listDiningUsage(): Promise<DiningUsage[]> {
  const { data, error } = await requireSupabase().from('dining_usage')
    .select('id,dining_enrollment_id,service_date,used,created_at,enrollment:student_dining_enrollments(id,student_id,student:students(id,person:people(first_name,last_name)),dining_service:dining_services(id,code,name))')
    .order('service_date', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as DiningUsage & { enrollment?: Relation<DiningUsage['enrollment']> };
    return { ...item, enrollment: one(item.enrollment) } as DiningUsage;
  });
}

export async function listActiveStudents(): Promise<Array<Pick<Student, 'id' | 'student_number'> & { person: { first_name: string; last_name: string } }>> {
  const { data, error } = await requireSupabase().from('students').select(`${studentSelect},is_active,student_number`).eq('is_active', true).order('student_number');
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as Pick<Student, 'id' | 'student_number'> & { person?: Relation<{ first_name: string; last_name: string }> };
    return { id: item.id, student_number: item.student_number, person: one(item.person) ?? { first_name: '', last_name: '' } };
  });
}
