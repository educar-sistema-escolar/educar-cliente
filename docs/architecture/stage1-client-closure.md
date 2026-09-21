# Canonical Stage 1 Client Closure

Stage 1 closes the client-side authenticated academic administration path:

- `/login` signs in with Supabase Auth and loads the user's `profiles` row.
- Administrative access requires the intentional role name `superadmin` and `profiles.is_active = true`.
- Supabase persists the session; logout calls Supabase Auth sign-out.
- `/privado` lands on the academic master-data surface (`/privado/niveles`).
- `/privado/alumnos`, `/privado/docentes`, `/privado/niveles`, `/privado/cursos`, and `/privado/materias` use `AcademicMasterDataPage` and `academicRepository`.
- Academic CRUD, enrollment, and course-subject assignment remain real Supabase-backed flows with their existing validation, loading, error, and empty states.

## Explicit boundaries

The legacy public/demo domains remain out of scope for this closure: local-storage news, opinions, comments, activities, forum/demo portals, and local/demo account administration. Enrollment request persistence is now covered by Stage 2 through the Supabase RPC boundary. None of these domains are administrative authorization sources and must not be used to grant `/privado` access.

No `service_role` key, password, or administrative secret belongs in this client. Runtime verification is still required against the configured Supabase project: authenticate an active `superadmin`, reject inactive/non-superadmin profiles, verify logout/session refresh, and exercise the academic CRUD, assignment, and Stage 2 enrollment-request flows under deployed RLS/RPC policies.
