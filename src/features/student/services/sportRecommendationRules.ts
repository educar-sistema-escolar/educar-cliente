import type { ScheduleBlock, SportRecommendation } from './sportRecommendationsRepository';

interface GroupScheduleRow {
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

interface SportGroupRow {
  id: string;
  sport_id: string;
  name: string;
  academic_year: number;
  educational_level_id: string | null;
  capacity: number;
  is_active: boolean;
  sport: { name: string; is_active: boolean } | Array<{ name: string; is_active: boolean }> | null;
  teacher: { person: { first_name: string; last_name: string } | Array<{ first_name: string; last_name: string }> | null } | Array<{ person: { first_name: string; last_name: string } | Array<{ first_name: string; last_name: string }> | null }> | null;
  schedules: GroupScheduleRow[] | null;
}

interface CurrentSportEnrollmentRow {
  sport_group_id: string;
  sport_group: {
    id: string;
    sport_id: string;
    schedules: GroupScheduleRow[] | null;
  } | Array<{
    id: string;
    sport_id: string;
    schedules: GroupScheduleRow[] | null;
  }> | null;
}

interface RecommendationInput {
  groups: SportGroupRow[];
  currentEnrollments: CurrentSportEnrollmentRow[];
  classSchedule: ScheduleBlock[];
  educationalLevelId: string;
  academicYear: number;
}

const one = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;
const timeMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

function toScheduleBlocks(rows: GroupScheduleRow[] | null | undefined): ScheduleBlock[] {
  return (rows ?? [])
    .filter((row) => row.is_active)
    .map((row) => ({ day: row.day_of_week, startsAt: row.starts_at.slice(0, 5), endsAt: row.ends_at.slice(0, 5) }));
}

function schedulesOverlap(left: ScheduleBlock, right: ScheduleBlock) {
  return left.day === right.day
    && timeMinutes(left.startsAt) < timeMinutes(right.endsAt)
    && timeMinutes(right.startsAt) < timeMinutes(left.endsAt);
}

export function selectSportRecommendations(input: RecommendationInput): SportRecommendation[] {
  const enrolledGroups = input.currentEnrollments
    .map((enrollment) => one(enrollment.sport_group))
    .filter((group): group is NonNullable<typeof group> => Boolean(group));

  if (enrolledGroups.length >= 2) return [];

  const enrolledGroupIds = new Set(enrolledGroups.map((group) => group.id));
  const enrolledSportIds = new Set(enrolledGroups.map((group) => group.sport_id));
  const currentSportSchedules = enrolledGroups.flatMap((group) => toScheduleBlocks(group.schedules));
  const existingSchedule = [...input.classSchedule, ...currentSportSchedules];

  return input.groups
    .filter((group) => group.is_active
      && group.educational_level_id === input.educationalLevelId
      && group.academic_year === input.academicYear
      && !enrolledGroupIds.has(group.id)
      && !enrolledSportIds.has(group.sport_id))
    .flatMap((group) => {
      const sport = one(group.sport);
      if (!sport?.is_active) return [];
      const schedules = toScheduleBlocks(group.schedules);
      if (!schedules.length || schedules.some((schedule) => existingSchedule.some((block) => schedulesOverlap(schedule, block)))) return [];
      const teacher = one(group.teacher);
      const teacherPerson = one(teacher?.person);
      const schedule = schedules.sort((left, right) => left.day - right.day || left.startsAt.localeCompare(right.startsAt));
      return [{
        id: group.id,
        sportName: sport.name,
        groupName: group.name,
        teacherName: teacherPerson ? `${teacherPerson.first_name} ${teacherPerson.last_name}` : null,
        schedule,
        capacity: group.capacity,
      }];
    })
    .sort((left, right) => left.sportName.localeCompare(right.sportName) || left.groupName.localeCompare(right.groupName));
}
