import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findSportScheduleConflict } from '../src/features/admin/services/sportScheduleRules.ts';

const groups = [
  { id: 'initial', teacher_id: 'teacher-1', academic_year: 2027 },
  { id: 'primary', teacher_id: 'teacher-1', academic_year: 2027 },
  { id: 'other-teacher', teacher_id: 'teacher-2', academic_year: 2027 },
  { id: 'next-year', teacher_id: 'teacher-1', academic_year: 2028 },
];

const schedule = (overrides = {}) => ({
  id: 'schedule-1',
  sport_group_id: 'initial',
  day_of_week: 1,
  starts_at: '16:00:00',
  ends_at: '17:00:00',
  is_active: true,
  ...overrides,
});

const input = (overrides = {}) => ({
  selectedGroupId: 'primary',
  dayOfWeek: 1,
  startsAt: '16:30',
  endsAt: '17:30',
  schedules: [schedule()],
  groups,
  ...overrides,
});

test('rejects overlapping schedules assigned to the same teacher and academic year', () => {
  assert.equal(findSportScheduleConflict(input()), 'teacher');
});

test('rejects an overlapping schedule within the same group', () => {
  assert.equal(findSportScheduleConflict(input({ selectedGroupId: 'initial' })), 'group');
});

test('allows adjacent times and schedules for another teacher, year, day, inactive group, or edited row', () => {
  assert.equal(findSportScheduleConflict(input({ startsAt: '17:00', endsAt: '18:00' })), null);
  assert.equal(findSportScheduleConflict(input({ schedules: [schedule({ sport_group_id: 'other-teacher' })] })), null);
  assert.equal(findSportScheduleConflict(input({ schedules: [schedule({ sport_group_id: 'next-year' })] })), null);
  assert.equal(findSportScheduleConflict(input({ schedules: [schedule({ day_of_week: 2 })] })), null);
  assert.equal(findSportScheduleConflict(input({ schedules: [schedule({ is_active: false })] })), null);
  assert.equal(findSportScheduleConflict(input({ editingScheduleId: 'schedule-1' })), null);
});
