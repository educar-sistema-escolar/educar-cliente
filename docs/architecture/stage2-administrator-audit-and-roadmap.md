# Stage 2 Administrator Audit and Roadmap

## Audit boundary

Audited the administrator route guard/layout, academic master-data page, academic repository, auth role/permission services, Supabase client wiring, and the sibling server migrations. The current client has a real Supabase-backed academic flow for levels, courses, subjects, teachers, students, enrollments, and course-subject assignments. Other administrator areas still contain demo or local-storage flows and are outside this slice.

## Audited flow and files

- `src/App.tsx` and `src/pages/admin/AdminLayout.tsx`: `/privado/*` routes and the active-superadmin route guard.
- `src/pages/admin/AcademicMasterDataPage.tsx`: catalog, teacher, student, enrollment, and course-subject assignment UI.
- `src/features/admin/services/academicRepository.ts` and `src/features/admin/types.ts`: Supabase reads/writes and domain contracts.
- `src/features/auth/services/permissions.ts`: permission definitions exist, but no administrator permission-management screen consumes them.
- `src/pages/admin/CuentasDelSistemaPage.tsx` and `src/features/auth/services/demoAuth.ts`: account administration is currently local/demo persistence, not `auth.users` provisioning.
- Legacy stores `src/features/inscripcion/services/enrollmentStore.ts`, `newsStore.ts`, `activitiesStore.ts`, `commentsStore.ts`, and `opinionStore.ts`: local/demo flows still require backend ownership.
- `src/pages/admin/StudentRegistrationPage.tsx`: legacy registration flow is not registered in the current admin route map.

## Current status

- **Implemented:** academic list/read methods; CRUD UI for levels, courses, and subjects; student enrollment and course-subject assignment; refresh and surfaced repository/page errors; client wiring for atomic teacher/student RPC writes; nullable teacher/student DNI and teacher specialty fields.
- **Partial:** server RPC availability and database columns are owned by the sibling server repository. This client targets `create_teacher`, `update_teacher`, `create_student`, and `update_student` with `p_payload`, but cannot verify deployment from this repository.
- **Missing:** real administrator account provisioning, complete audit-log UI, replacement of legacy local/demo administrator domains, production observability, and end-to-end authorization testing.

## Exact Stage 2 scope

Harden the existing academic master-data surface without changing unrelated local-storage domains: preserve list/read queries, route teacher/student writes through server-owned atomic RPCs, expose nullable `dni` for teachers and students, expose nullable `specialty` for teachers, refresh the affected view after writes, and report failures without hiding them.

## Stage 2 acceptance checklist

- [x] Existing academic catalog lists and edits through Supabase.
- [x] Teacher and student create/update writes use one server transaction each.
- [x] DNI is stored on `people` and is normalized/unique when present.
- [x] Teacher specialty is stored on `teachers`.
- [x] Client refreshes complete records after RPC writes and surfaces failures.
- [ ] Apply the ordered migrations and execute authenticated superadmin/non-superadmin checks against the target database.
- [ ] Add full lifecycle actions for enrollment and course-subject assignments after their business rules are agreed.

## Plan and verification

1. Keep the client contract aligned with the server RPC migration and deployed return shape.
2. Run TypeScript/build and lint checks in the client repository.
3. Verify authenticated superadmin access, successful create/update/refresh for teachers and students, nullable DNI/specialty rendering, and RPC error rendering against the server environment.

Client code was statically updated; live RPC verification remains pending until the sibling server RPC migration is present and deployed.

The remaining Stage 2 backend proof is intentionally a deployment/runtime task, not a client workaround.

## Later stages

3. **Users and permissions:** real account provisioning, role assignment, activation/deactivation, and last-superadmin protections in the UI.
4. **Activities and schedules:** replace local activity data with server-backed academic scheduling and participation flows.
5. **Transport and cafeteria:** model assignments, availability, attendance, and operational administration.
6. **Reports:** audited, permission-aware exports and operational dashboards.
7. **Production hardening:** audit-log review, observability, performance, backup/recovery checks, security review, and end-to-end release verification.
