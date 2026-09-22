# Administrative module implementation status

## Delivered in this slice

- Administrative service pages are split into sports, transport, and dining subpages.
- Service persistence is isolated in `src/features/admin/services/` repositories.
- Sports groups and schedules, transport stops, dining slots, enrollment deactivation, and usage registration are exposed from the admin UI.
- Administrative report selection, typed columns, filters, loading/error/empty states, and CSV export are available.
- Login supports password recovery and password update through Supabase Auth.

## Deliberate scope

- Only the administrative module is covered. Teacher, student, family, and community portals remain outside this change.
- The database migration is prepared in the server repository but was not applied remotely because the Supabase CLI connection currently hangs. Apply it manually in Supabase SQL Editor and run the acceptance queries before using configurable permissions and the new report codes.

## Verification

- `npm run build`: passed.
- Focused ESLint for changed administrative/auth files: passed.
- Full ESLint still reports pre-existing issues in out-of-scope legacy pages; those files were not changed here.
