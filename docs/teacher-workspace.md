# Teacher workspace

Active institutional teacher accounts enter `/docentes` after login. Reloading the page validates the Supabase identity again; administrator routes remain restricted to superadmins. Local/demo sessions do not grant access.

## Available tools

- Assigned subjects and courses, grouped by academic year.
- Searchable subject roster with institutional grades and observations.
- CSV export of the filtered roster and academic history. Treat downloaded files as personal student data and use institutional sharing channels only.
- Weekly agenda at `/docentes/agenda`, including subject-specific and general course blocks. This is the recurring timetable, not a holiday calendar.

The backend currently restricts grade creation/editing to administrators. The teacher workspace is intentionally read-only; it does not simulate attendance, grades, or students.

## Account setup

Administration must provision an active profile with role `teacher`, an active `people` record linked by `profile_id`, an active `teachers` record linked by `person_id`, and active `course_subjects` assignments linked by `teacher_id`. Students must have active subject enrollments to appear in a roster. Missing assignments produce an explanatory empty state, not demo data.

## Focused checks

Requires Node 22 and the existing installed TypeScript development dependency:

```sh
node --experimental-strip-types tests/teacher-access.test.mjs
node --experimental-vm-modules tests/teacher-session.test.mjs
node --experimental-strip-types tests/teacher-data.test.mjs
node --experimental-strip-types tests/teacher-agenda.test.mjs
npm run build
```

The session test runs the actual authentication implementation with a controlled Supabase fixture; it does not authenticate a real teacher account or prove production database configuration. Production acceptance requires signing in with an authorized teacher account and confirming its assigned courses.
