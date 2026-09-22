import { requireSupabase } from '../../auth/services/supabaseClient';

export * from './sportsRepository';
export * from './transportRepository';
export * from './diningRepository';
export * from './reportsRepository';

export { listSportEnrollments as listStudentSportEnrollments } from './sportsRepository';
export { listTransportEnrollments as listStudentTransportEnrollments } from './transportRepository';
export { listDiningEnrollments as listStudentDiningEnrollments } from './diningRepository';

export async function deactivateServiceEnrollment(type: 'sport' | 'transport' | 'dining', id: string): Promise<void> {
  await setServiceEnrollmentActive(type, id, false);
}

export const deactivateStudentServiceEnrollment = deactivateServiceEnrollment;

export async function setServiceEnrollmentActive(type: 'sport' | 'transport' | 'dining', id: string, isActive: boolean): Promise<void> {
  const table = {
    sport: 'student_sport_enrollments',
    transport: 'student_transport_enrollments',
    dining: 'student_dining_enrollments',
  }[type];
  const { error } = await requireSupabase().from(table).update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(`No se pudo completar la operación de servicios: ${error.message}`);
}
