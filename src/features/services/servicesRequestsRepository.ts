import { requireSupabase } from '../auth/services/supabaseClient';

export type RequestedServiceType = 'sport' | 'transport';
export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ServiceAvailability {
  service_type: RequestedServiceType;
  service_id: string;
  academic_year: number;
  capacity: number;
  occupied: number;
  available: number;
}

export interface SportRequestOption {
  id: string;
  sport_id: string;
  name: string;
  educational_level_id: string | null;
  academic_year: number;
  capacity: number;
  sport: { name: string } | null;
  level: { name: string } | null;
  teacher: { person: { first_name: string; last_name: string } | null } | null;
  schedules: Array<{ id: string; day_of_week: number; starts_at: string; ends_at: string; is_active: boolean }>;
}

interface SportRequestOptionRow {
  id: string;
  sport_id: string;
  name: string;
  educational_level_id: string | null;
  academic_year: number;
  capacity: number;
  sport_name: string | null;
  level_name: string | null;
  teacher_first_name: string | null;
  teacher_last_name: string | null;
  schedules: SportRequestOption['schedules'] | null;
}

export interface TransportRequestOption {
  id: string;
  route_number: number;
  name: string;
  capacity: number;
  stops: Array<{ id: string; route_id: string; name: string; stop_order: number; is_active: boolean }>;
}

export interface StudentServiceRequest {
  id: string;
  student_id: string;
  service_type: RequestedServiceType;
  academic_year: number;
  requested_sport_group_id: string | null;
  requested_route_id: string | null;
  requested_stop_id: string | null;
  status: ServiceRequestStatus;
  review_note: string | null;
  created_at: string;
  student: { student_number: string | null; person: { first_name: string; last_name: string } | null } | null;
  sport_group: { id: string; name: string; sport: { name: string } | null } | null;
  route: { id: string; route_number: number; name: string } | null;
  stop: { id: string; name: string } | null;
}

const requestSelect = 'id,student_id,service_type,academic_year,requested_sport_group_id,requested_route_id,requested_stop_id,status,review_note,created_at,student:students(student_number,person:people(first_name,last_name)),sport_group:sport_groups(id,name,sport:sports(name)),route:transport_routes(id,route_number,name),stop:transport_stops(id,name)';

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listServiceEnrollmentAvailability(academicYear: number) {
  const { data, error } = await requireSupabase().rpc('list_service_enrollment_availability', { p_academic_year: academicYear });
  fail(error);
  return (data ?? []) as ServiceAvailability[];
}

export async function listSportRequestOptions(academicYear: number, studentId: string) {
  const { data, error } = await requireSupabase().rpc('list_sport_request_options', {
    p_student_id: studentId,
    p_academic_year: academicYear,
  });
  fail(error);
  return ((data ?? []) as SportRequestOptionRow[]).map((row) => ({
    id: row.id,
    sport_id: row.sport_id,
    name: row.name,
    educational_level_id: row.educational_level_id,
    academic_year: row.academic_year,
    capacity: row.capacity,
    sport: row.sport_name ? { name: row.sport_name } : null,
    level: row.level_name ? { name: row.level_name } : null,
    teacher: row.teacher_first_name || row.teacher_last_name
      ? { person: { first_name: row.teacher_first_name ?? '', last_name: row.teacher_last_name ?? '' } }
      : null,
    schedules: row.schedules ?? [],
  })) as SportRequestOption[];
}

export async function listTransportRequestOptions() {
  const { data, error } = await requireSupabase().from('transport_routes')
    .select('id,route_number,name,capacity,stops:transport_stops(id,route_id,name,stop_order,is_active)')
    .eq('is_active', true).order('route_number');
  fail(error);
  return (data ?? []) as unknown as TransportRequestOption[];
}

export async function listStudentServiceRequests(options: { studentId?: string; serviceType?: RequestedServiceType } = {}) {
  let query = requireSupabase().from('student_service_requests').select(requestSelect).order('created_at', { ascending: false });
  if (options.studentId) query = query.eq('student_id', options.studentId);
  if (options.serviceType) query = query.eq('service_type', options.serviceType);
  const { data, error } = await query;
  fail(error);
  return (data ?? []) as unknown as StudentServiceRequest[];
}

export async function submitStudentServiceRequest(input: {
  studentId: string;
  serviceType: RequestedServiceType;
  academicYear: number;
  sportGroupId?: string;
  routeId?: string;
  stopId?: string | null;
}) {
  const { data, error } = await requireSupabase().rpc('submit_student_service_request', {
    p_student_id: input.studentId,
    p_service_type: input.serviceType,
    p_academic_year: input.academicYear,
    p_sport_group_id: input.sportGroupId ?? null,
    p_route_id: input.routeId ?? null,
    p_stop_id: input.stopId ?? null,
  });
  fail(error);
  return data as { id: string; status: ServiceRequestStatus };
}

export async function reviewStudentServiceRequest(input: {
  requestId: string;
  action: 'approve' | 'reject';
  assignedServiceId?: string;
  assignedStopId?: string | null;
  note?: string;
}) {
  const { data, error } = await requireSupabase().rpc('review_student_service_request', {
    p_request_id: input.requestId,
    p_action: input.action,
    p_assigned_service_id: input.assignedServiceId ?? null,
    p_assigned_stop_id: input.assignedStopId ?? null,
    p_note: input.note ?? null,
  });
  fail(error);
  return data as StudentServiceRequest;
}
