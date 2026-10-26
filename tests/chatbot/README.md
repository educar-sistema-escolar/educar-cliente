# Student chatbot: RED-first contracts

Step 1 adds tests only. No chatbot, production source, database schema, or access policy is implemented here.

## Existing boundaries

Run `node --experimental-vm-modules --test tests/chatbot/*.test.mjs`.
The tests transpile and execute the **actual** institutional auth and student repository in isolated VM modules. Only Supabase is replaced. They do not copy the application mapper or conversation engine.

Initial observation: **22 tests, 21 PASS, 1 RED**. `D03` demonstrates that `loadStudentPortal` selects `route_number` but discards it when mapping transport. This regression remains intentionally unfixed in this test-only step. Passing auth tests characterize existing protections; they do not claim that a nonexistent chatbot enforces them.

Fixtures include one active transport per student/year, two sports in 2026, a second transport in 2025, and inactive records. This respects current enrollment constraints. Null/array joins and repository errors exercise the real mapper. The fake query boundary rejects unknown tables and exposes no mutation methods.

## Verification of the first unit

| Command | Observed result |
|---|---|
| `node --experimental-vm-modules --test tests/chatbot/*.test.mjs` | 21 PASS / 1 RED, route number lost |
| `node --experimental-strip-types --experimental-vm-modules --test tests/teacher-*.test.mjs` | 4 PASS |
| `npm run build` before test changes | PASS; existing large-bundle warning |
| `npm run lint` before test changes | Existing 4 errors / 4 warnings |

The first teacher command without `--experimental-strip-types` failed to load `.ts` files on Node 22.17.1; the corrected command above passes all four. This is a runner requirement, not a product regression.

Runtime harness: real auth/repository modules against a simulated Supabase boundary, no browser needed for this unit. Rollback boundary: remove this directory's unit tests, fixtures and this document; no runtime behavior changes.
