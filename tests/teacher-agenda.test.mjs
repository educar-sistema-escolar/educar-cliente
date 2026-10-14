import assert from 'node:assert/strict';
import { groupSchedulesByDay } from '../src/features/teacher/services/teacherUtils.ts';
const days = groupSchedulesByDay([{ day_of_week: 1, starts_at: '10:00' }, { day_of_week: 1, starts_at: '08:00' }, { day_of_week: 0, starts_at: '09:00' }]);
assert.equal(days.length, 7);
assert.deepEqual(days[0].map(item => item.starts_at), ['08:00', '10:00']);
assert.equal(days[6].length, 1);
assert.equal(groupSchedulesByDay([]).every(day => day.length === 0), true);
console.log('Teacher weekly agenda checks passed.');
