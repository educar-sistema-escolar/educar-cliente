# Administrative module progress — 2026-09-22

## Implemented in code

- Configurable permissions screen at `/privado/permisos` backed by `permissions` and `role_permissions`.
- Academic records screen at `/privado/registros-academicos` for subject enrollment, academic history, and schedules.
- Services screen at `/privado/servicios` for sports, transport, and dining administration.
- Reports screen at `/privado/reportes` with permission-protected report selection and CSV export.
- The former local activity route now redirects to the real services module.

## Server contracts added

The client expects the migrations in the server repository to be applied in order:

1. `20260922100000_work_unit_a_academic_records.sql`
2. `20260922110000_work_unit_b_services.sql`
3. `20260922120000_reporting.sql`

The Supabase CLI/runtime could not be validated in this environment. The frontend and SQL are committed independently so applying the migrations can be performed manually or when the CLI connection is available.

## Verification

- TypeScript build: passed locally.
- Focused ESLint for all changed admin files: passed.
- Supabase execution/RLS acceptance: pending remote runtime access, not a frontend blocker.
