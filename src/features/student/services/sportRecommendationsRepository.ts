import { requireSupabase } from '../../auth/services/supabaseClient';
import { selectSportRecommendations } from './sportRecommendationRules';

export interface ScheduleBlock {
  day: number;
  startsAt: string;
  endsAt: string;
}

export interface SportRecommendation {
  id: string;
  sportName: string;
  groupName: string;
  teacherName: string | null;
  schedule: ScheduleBlock[];
  capacity: number;
}

const weekDayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export async function loadSportRecommendations(
  studentId: string,
  educationalLevelId: string | null,
  academicYear: number,
  classSchedule: ScheduleBlock[],
): Promise<SportRecommendation[]> {
  if (!educationalLevelId) return [];

  const supabase = requireSupabase();
  const [groupsResult, enrollmentsResult] = await Promise.all([
    supabase.from('sport_groups')
      .select('id,sport_id,name,academic_year,educational_level_id,capacity,is_active,sport:sports(name,is_active),teacher:teachers(person:people(first_name,last_name)),schedules:sport_group_schedules(day_of_week,starts_at,ends_at,is_active)')
      .eq('educational_level_id', educationalLevelId)
      .eq('academic_year', academicYear)
      .eq('is_active', true),
    supabase.from('student_sport_enrollments')
      .select('sport_group_id,sport_group:sport_groups(id,sport_id,schedules:sport_group_schedules(day_of_week,starts_at,ends_at,is_active))')
      .eq('student_id', studentId)
      .eq('academic_year', academicYear)
      .eq('is_active', true),
  ]);

  if (groupsResult.error) throw new Error(`No se pudieron consultar los grupos deportivos: ${groupsResult.error.message}`);
  if (enrollmentsResult.error) throw new Error(`No se pudieron comprobar tus inscripciones deportivas: ${enrollmentsResult.error.message}`);

  return selectSportRecommendations({
    groups: (groupsResult.data ?? []) as unknown as Parameters<typeof selectSportRecommendations>[0]['groups'],
    currentEnrollments: (enrollmentsResult.data ?? []) as unknown as Parameters<typeof selectSportRecommendations>[0]['currentEnrollments'],
    classSchedule,
    educationalLevelId,
    academicYear,
  });
}

export function formatRecommendationSchedule(schedule: ScheduleBlock[]) {
  return schedule.map((block) => `${weekDayNames[block.day] ?? 'Día'} ${block.startsAt}–${block.endsAt}`).join(' · ');
}
