import type { SportGroup, SportGroupSchedule } from '../types';

type ScheduleGroup = Pick<SportGroup, 'id' | 'teacher_id' | 'academic_year'>;

type ScheduleConflictInput = {
  selectedGroupId: string;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  schedules: SportGroupSchedule[];
  groups: ScheduleGroup[];
  editingScheduleId?: string | null;
};

export function findSportScheduleConflict({
  selectedGroupId,
  dayOfWeek,
  startsAt,
  endsAt,
  schedules,
  groups,
  editingScheduleId,
}: ScheduleConflictInput): 'group' | 'teacher' | null {
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  for (const schedule of schedules) {
    if (!schedule.is_active || schedule.id === editingScheduleId || schedule.day_of_week !== dayOfWeek) continue;
    if (schedule.starts_at.slice(0, 5) >= endsAt || startsAt >= schedule.ends_at.slice(0, 5)) continue;
    if (schedule.sport_group_id === selectedGroupId) return 'group';

    const assignedGroup = groups.find((group) => group.id === schedule.sport_group_id);
    if (
      selectedGroup?.teacher_id
      && selectedGroup.teacher_id === assignedGroup?.teacher_id
      && selectedGroup.academic_year === assignedGroup.academic_year
    ) return 'teacher';
  }

  return null;
}
