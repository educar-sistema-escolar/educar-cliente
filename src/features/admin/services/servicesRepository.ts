import { requireSupabase } from '../../auth/services/supabaseClient';

export * from './sportsRepository';
export * from './transportRepository';
export * from './diningRepository';
export * from './reportsRepository';

export { listSportEnrollments as listStudentSportEnrollments } from './sportsRepository';
export { listTransportEnrollments as listStudentTransportEnrollments } from './transportRepository';
export { listDiningEnrollments as listStudentDiningEnrollments } from './diningRepository';

export async function deactivateServiceEnrollment(type: 'sport' | 'transport' | 'dining', id: string): Promise<void> {
  const { error } = await requireSupabase().rpc('deactivate_student_service_enrollment', { p_table: type, p_id: id });
  if (error) throw new Error(`No se pudo completar la operación de servicios: ${error.message}`);
}

export const deactivateStudentServiceEnrollment = deactivateServiceEnrollment;
