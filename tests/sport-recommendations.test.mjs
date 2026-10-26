import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectSportRecommendations } from '../src/features/student/services/sportRecommendationRules.ts';

const group = (overrides = {}) => ({
  id: 'group-1',
  sport_id: 'sport-1',
  name: 'Grupo inicial',
  educational_level_id: 'level-primary',
  academic_year: 2027,
  capacity: 20,
  is_active: true,
  sport: { name: 'Básquet', is_active: true },
  teacher: { person: { first_name: 'Laura', last_name: 'Benítez' } },
  schedules: [{ day_of_week: 2, starts_at: '16:00:00', ends_at: '17:00:00', is_active: true }],
  ...overrides,
});

const input = (overrides = {}) => ({
  groups: [group()],
  currentEnrollments: [],
  classSchedule: [],
  educationalLevelId: 'level-primary',
  academicYear: 2027,
  ...overrides,
});

test('recommends active groups for the student level and cycle with matching teacher and hours', () => {
  const [recommendation] = selectSportRecommendations(input());
  assert.equal(recommendation.sportName, 'Básquet');
  assert.equal(recommendation.teacherName, 'Laura Benítez');
  assert.deepEqual(recommendation.schedule, [{ day: 2, startsAt: '16:00', endsAt: '17:00' }]);
});

test('excludes inactive, other-level and other-cycle groups', () => {
  const result = selectSportRecommendations(input({
    groups: [
      group({ is_active: false }),
      group({ id: 'wrong-level', educational_level_id: 'level-secondary' }),
      group({ id: 'wrong-year', academic_year: 2026 }),
    ],
  }));
  assert.deepEqual(result, []);
});

test('excludes class schedule overlaps and an already enrolled sport', () => {
  assert.deepEqual(selectSportRecommendations(input({
    classSchedule: [{ day: 2, startsAt: '16:30', endsAt: '17:30' }],
  })), []);

  assert.deepEqual(selectSportRecommendations(input({
    currentEnrollments: [{ sport_group_id: 'old-group', sport_group: { id: 'old-group', sport_id: 'sport-1', schedules: [] } }],
  })), []);
});

test('excludes overlaps with existing sports and stops at the two-sport limit', () => {
  const existing = { sport_group_id: 'old-group', sport_group: {
    id: 'old-group', sport_id: 'sport-2',
    schedules: [{ day_of_week: 2, starts_at: '16:30:00', ends_at: '18:00:00', is_active: true }],
  } };
  assert.deepEqual(selectSportRecommendations(input({ currentEnrollments: [existing] })), []);
  assert.deepEqual(selectSportRecommendations(input({ currentEnrollments: [existing, { ...existing, sport_group_id: 'old-2' }] })), []);
});
