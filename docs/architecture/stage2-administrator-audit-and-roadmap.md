# Stage 2 Administrator Audit and Roadmap

## Audit boundary

Audited the administrator route guard/layout, academic master-data page, academic repository, enrollment request flow, auth role/permission services, Supabase client wiring, and the sibling server migrations. The current client has a real Supabase-backed academic flow for levels, courses, subjects, teachers, students, enrollments, course-subject assignments, and enrollment requests. Other administrator areas still contain demo or local-storage flows and are outside this slice.

## Audited flow and files

- `src/App.tsx` and `src/pages/admin/AdminLayout.tsx`: `/privado/*` routes and the active-superadmin route guard.
- `src/pages/admin/AcademicMasterDataPage.tsx`: catalog, teacher, student, enrollment, and course-subject assignment UI.
- `src/features/admin/services/academicRepository.ts` and `src/features/admin/types.ts`: Supabase reads/writes and domain contracts.
- `src/features/auth/services/permissions.ts`: permission definitions exist, but no administrator permission-management screen consumes them.
- `src/pages/admin/CuentasDelSistemaPage.tsx`: account administration was delivered in Stage 1 through the Supabase provisioning boundary; remaining demo surfaces are outside this slice.
- `src/features/inscripcion/services/enrollmentStore.ts`: Supabase RPC repository for public intake and superadmin request actions.
- Legacy stores `newsStore.ts`, `activitiesStore.ts`, `commentsStore.ts`, and `opinionStore.ts`: local/demo flows still require backend ownership.
- `src/pages/admin/StudentRegistrationPage.tsx`: legacy registration flow is not registered in the current admin route map.

## Current status

- **Implemented:** academic list/read methods; CRUD UI for levels, courses, and subjects; student enrollment and course-subject assignment; refresh and surfaced repository/page errors; client wiring for atomic teacher/student RPC writes; nullable teacher/student DNI and teacher specialty fields; persistent enrollment request intake and superadmin approval/rejection/archive actions.
- **Partial:** server RPC availability and database columns are owned by the sibling server repository. This client targets `create_teacher`, `update_teacher`, `create_student`, and `update_student` with `p_payload`, but cannot verify deployment from this repository.
- **Missing:** complete audit-log UI, replacement of unrelated legacy local/demo administrator domains, production observability, and end-to-end authorization testing.

## Exact Stage 2 scope

Close the Stage 2 enrollment slice without changing unrelated local-storage domains: persist public requests through the server RPC boundary, list them for active superadmins, approve them against an explicit active course, and expose reject/archive transitions with refresh and surfaced failures. Approval remains server-owned and atomic.

## Stage 2 acceptance checklist

- [x] Existing academic catalog lists and edits through Supabase.
- [x] Teacher and student create/update writes use one server transaction each.
- [x] DNI is stored on `people` and is normalized/unique when present.
- [x] Teacher specialty is stored on `teachers`.
- [x] Client refreshes complete records after RPC writes and surfaces failures.
- [x] Public enrollment requests use Supabase persistence instead of localStorage.
- [x] Superadmins can list, approve, reject, and archive requests through RPCs.
- [ ] Apply the ordered migrations and execute authenticated superadmin/non-superadmin checks against the target database.
- [ ] Run the enrollment lifecycle and capacity/inactive-reference checks against the target database.

## Plan and verification

1. Apply the ordered migrations, including `20260921220000_stage2_enrollment_requests.sql`, and verify the deployed RPC return shape.
2. Run TypeScript/build and lint checks in the client repository.
3. Verify authenticated superadmin access, successful create/update/refresh for teachers and students, nullable DNI/specialty rendering, and RPC error rendering against the server environment.

Account provisioning is a Stage 1 responsibility and is already delivered through the server Edge Function. Enrollment persistence and lifecycle actions are the Stage 2 responsibility. Client and server code are statically aligned; live RPC/RLS/capacity verification remains pending until the new migration is applied to a target Supabase project.

The remaining Stage 2 backend proof is intentionally a deployment/runtime task, not a client workaround.

## Later stages

3. **Users and permissions:** complete audit-log visibility and permission-management UI.
4. **Activities and schedules:** replace local activity data with server-backed academic scheduling and participation flows.
5. **Transport and cafeteria:** model assignments, availability, attendance, and operational administration.
6. **Reports:** audited, permission-aware exports and operational dashboards.
7. **Production hardening:** audit-log review, observability, performance, backup/recovery checks, security review, and end-to-end release verification.
