import { requireSupabase } from '../../auth/services/supabaseClient';
import type { StudentTransportEnrollment, TransportRoute, TransportStop } from '../types';

type Relation<T> = T | T[] | null | undefined;
const one = <T>(value: Relation<T>): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;
const repositoryError = (message: string) => new Error(`No se pudo completar la operación de servicios: ${message}`);
const studentSelect = 'id,student_number,person:people!inner(first_name,last_name)';

export async function listTransportRoutes(): Promise<TransportRoute[]> {
  const { data, error } = await requireSupabase().from('transport_routes').select('id,route_number,name,capacity,is_active,stops:transport_stops(id,route_id,name,stop_order,is_active)').order('route_number');
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => ({ ...row, stops: (row as { stops?: TransportRoute['stops'] }).stops ?? [] })) as TransportRoute[];
}

export async function listTransportEnrollments(): Promise<StudentTransportEnrollment[]> {
  const { data, error } = await requireSupabase().from('student_transport_enrollments')
    .select(`id,student_id,route_id,stop_id,academic_year,is_active,student:students(${studentSelect}),route:transport_routes(id,route_number,name,capacity,is_active),stop:transport_stops(id,name)`)
    .order('academic_year', { ascending: false }).order('enrolled_at', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as StudentTransportEnrollment & { student?: Relation<StudentTransportEnrollment['student']>; route?: Relation<StudentTransportEnrollment['route']>; stop?: Relation<StudentTransportEnrollment['stop']> };
    return { ...item, student: one(item.student), route: one(item.route), stop: one(item.stop) };
  });
}

export async function enrollStudentInTransport(studentId: string, routeId: string, stopId: string | null): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_transport', { p_student_id: studentId, p_route_id: routeId, p_stop_id: stopId });
  if (error) throw repositoryError(error.message);
}

export async function createTransportRoute(input: Pick<TransportRoute, 'route_number' | 'name' | 'capacity'>): Promise<void> {
  const { error } = await requireSupabase().from('transport_routes').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateTransportRoute(id: string, input: Pick<TransportRoute, 'is_active'>): Promise<void> {
  const { error } = await requireSupabase().from('transport_routes').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}

export async function createTransportStop(input: Pick<TransportStop, 'route_id' | 'name' | 'stop_order'>): Promise<void> {
  const { error } = await requireSupabase().from('transport_stops').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateTransportStop(id: string, input: Partial<Pick<TransportStop, 'name' | 'stop_order' | 'is_active'>>): Promise<void> {
  const { error } = await requireSupabase().from('transport_stops').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}
