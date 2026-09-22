import { requireSupabase } from '../../auth/services/supabaseClient';
import type { DiningService, DiningUsage, Sport, SportGroup, Student, StudentDiningEnrollment, StudentSportEnrollment, StudentTransportEnrollment, TransportRoute } from '../types';

type Relation<T> = T | T[] | null | undefined;
const one = <T>(value: Relation<T>): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;
const repositoryError = (message: string) => new Error(`No se pudo completar la operación de servicios: ${message}`);

const studentSelect = 'id,student_number,person:people!inner(first_name,last_name)';

export async function listSports(): Promise<Sport[]> {
  const { data, error } = await requireSupabase().from('sports').select('id,code,name,is_active').order('name');
  if (error) throw repositoryError(error.message);
  return (data ?? []) as Sport[];
}

export async function listSportGroups(): Promise<SportGroup[]> {
  const { data, error } = await requireSupabase().from('sport_groups')
    .select('id,sport_id,name,educational_level_id,teacher_id,academic_year,capacity,is_active,sport:sports(id,code,name,is_active),level:educational_levels(id,name),teacher:teachers(id,person:people(first_name,last_name))')
    .order('academic_year', { ascending: false }).order('name');
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as SportGroup & { sport?: Relation<Sport>; level?: Relation<SportGroup['level']>; teacher?: Relation<SportGroup['teacher']> };
    return { ...item, sport: one(item.sport), level: one(item.level), teacher: one(item.teacher) };
  }) as SportGroup[];
}

export async function listSportEnrollments(): Promise<StudentSportEnrollment[]> {
  const { data, error } = await requireSupabase().from('student_sport_enrollments')
    .select(`id,student_id,sport_group_id,academic_year,is_active,student:students(${studentSelect}),sport_group:sport_groups(id,sport_id,name,academic_year,capacity,is_active,sport:sports(id,code,name,is_active))`)
    .order('academic_year', { ascending: false }).order('enrolled_at', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as StudentSportEnrollment & { student?: Relation<StudentSportEnrollment['student']>; sport_group?: Relation<StudentSportEnrollment['sport_group']> };
    return { ...item, student: one(item.student), sport_group: one(item.sport_group) };
  });
}

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

export async function enrollStudentInSportGroup(studentId: string, sportGroupId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_sport_group', { p_student_id: studentId, p_sport_group_id: sportGroupId });
  if (error) throw repositoryError(error.message);
}

export async function enrollStudentInTransport(studentId: string, routeId: string, stopId: string | null): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_transport', { p_student_id: studentId, p_route_id: routeId, p_stop_id: stopId });
  if (error) throw repositoryError(error.message);
}

export async function enrollStudentInDining(studentId: string, serviceId: string, academicYear: number): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_dining', { p_student_id: studentId, p_dining_service_id: serviceId, p_academic_year: academicYear });
  if (error) throw repositoryError(error.message);
}

export async function deactivateServiceEnrollment(type: 'sport' | 'transport' | 'dining', id: string): Promise<void> {
  const { error } = await requireSupabase().rpc('deactivate_student_service_enrollment', { p_table: type, p_id: id });
  if (error) throw repositoryError(error.message);
}

export async function recordDiningUsage(input: { dining_enrollment_id: string; service_date: string; used: boolean }): Promise<void> {
  const { error } = await requireSupabase().rpc('record_dining_usage', { p_dining_enrollment_id: input.dining_enrollment_id, p_service_date: input.service_date, p_used: input.used });
  if (error) throw repositoryError(error.message);
}

export async function createSport(input: Pick<Sport, 'code' | 'name'>): Promise<void> {
  const { error } = await requireSupabase().from('sports').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateSport(id: string, input: Pick<Sport, 'is_active'>): Promise<void> {
  const { error } = await requireSupabase().from('sports').update(input).eq('id', id);
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

export async function createDiningService(input: Pick<DiningService, 'code' | 'name' | 'capacity'>): Promise<void> {
  const { error } = await requireSupabase().from('dining_services').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateDiningService(id: string, input: Pick<DiningService, 'is_active'>): Promise<void> {
  const { error } = await requireSupabase().from('dining_services').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}

export const listStudentSportEnrollments = listSportEnrollments;
export const listStudentTransportEnrollments = listTransportEnrollments;
export const listStudentDiningEnrollments = listDiningEnrollments;
export const deactivateStudentServiceEnrollment = deactivateServiceEnrollment;

export async function listDiningUsage(): Promise<DiningUsage[]> {
  const { data, error } = await requireSupabase().from('dining_usage')
    .select('id,dining_enrollment_id,service_date,used,created_at,enrollment:student_dining_enrollments(id,student_id,student:students(id,person:people(first_name,last_name)),dining_service:dining_services(id,code,name))')
    .order('service_date', { ascending: false });
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as DiningUsage & { enrollment?: Relation<DiningUsage['enrollment']> };
    const enrollment = one(item.enrollment);
    return { ...item, enrollment } as DiningUsage;
  });
}

export type AdminReportCode = 'student_overview' | 'students_by_course' | 'students_by_subject' | 'teachers_by_level' | 'students_by_sport' | 'students_by_sport_schedule' | 'students_by_transport';

export async function getAdminReport(reportCode: AdminReportCode): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await requireSupabase().rpc('get_admin_report', { p_report_code: reportCode });
  if (error) throw repositoryError(error.message);
  return Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
}

export async function listActiveStudents(): Promise<Array<Pick<Student, 'id' | 'student_number'> & { person: { first_name: string; last_name: string } }>> {
  const { data, error } = await requireSupabase().from('students').select(`${studentSelect},is_active,student_number`).eq('is_active', true).order('student_number');
  if (error) throw repositoryError(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as Pick<Student, 'id' | 'student_number'> & { person?: Relation<{ first_name: string; last_name: string }> };
    return { id: item.id, student_number: item.student_number, person: one(item.person) ?? { first_name: '', last_name: '' } };
  });
}
