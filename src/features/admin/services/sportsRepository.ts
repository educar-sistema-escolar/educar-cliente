import { requireSupabase } from '../../auth/services/supabaseClient';
import type { Sport, SportGroup, SportGroupSchedule, StudentSportEnrollment } from '../types';

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

export async function listSportGroupSchedules(): Promise<SportGroupSchedule[]> {
  const { data, error } = await requireSupabase().from('sport_group_schedules')
    .select('id,sport_group_id,day_of_week,starts_at,ends_at,is_active')
    .order('day_of_week').order('starts_at');
  if (error) throw repositoryError(error.message);
  return (data ?? []) as SportGroupSchedule[];
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

export async function enrollStudentInSportGroup(studentId: string, sportGroupId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('enroll_student_in_sport_group', { p_student_id: studentId, p_sport_group_id: sportGroupId });
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

export async function createSportGroup(input: Pick<SportGroup, 'sport_id' | 'name' | 'educational_level_id' | 'teacher_id' | 'academic_year' | 'capacity'>): Promise<void> {
  const { error } = await requireSupabase().from('sport_groups').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateSportGroup(id: string, input: Partial<Pick<SportGroup, 'name' | 'educational_level_id' | 'teacher_id' | 'capacity' | 'is_active'>>): Promise<void> {
  const { error } = await requireSupabase().from('sport_groups').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}

export async function createSportGroupSchedule(input: Omit<SportGroupSchedule, 'id' | 'is_active'> & { is_active?: boolean }): Promise<void> {
  const { error } = await requireSupabase().from('sport_group_schedules').insert(input);
  if (error) throw repositoryError(error.message);
}

export async function updateSportGroupSchedule(id: string, input: Partial<Pick<SportGroupSchedule, 'day_of_week' | 'starts_at' | 'ends_at' | 'is_active'>>): Promise<void> {
  const { error } = await requireSupabase().from('sport_group_schedules').update(input).eq('id', id);
  if (error) throw repositoryError(error.message);
}
