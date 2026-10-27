# Student chatbot: RED-first contracts

Step 1 originally added tests only. Later steps add pure conversation definitions, an isolated window and an authenticated read adapter. The chatbot is not mounted in the application; no database schema or access policy changes are included.

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

## Browser contract

Use Node 22+, `npm ci`, then `npx playwright install chromium` if Chromium is not cached.

```sh
npm run test:existing
npm run test:chatbot:check
npm run test:chatbot:unit
npm run test:chatbot:browser
```

For a bounded smoke, run `node node_modules/@playwright/test/cli.js test --grep "personalized button-only home|verified.*account" --workers=1`. Direct invocation avoids argument-forwarding quirks in Windows PowerShell/npm.

The browser harness builds and serves the actual application with a synthetic Supabase project URL/key. Network handlers replace only Supabase HTTP responses. They never render a substitute chatbot. Google Fonts requests are intercepted; other unexpected external traffic and all service writes fail closed. A separate context per test prevents account/fixture leakage. There are no skipped tests, retries, forced failures or wrappers that turn RED into success.

The portal already reads services when its page loads. Query-count assertions start **after that existing page is ready** and measure additional chatbot queries; they do not demand that the general-purpose portal loader become a new topic-only API. The backend worker separately tests real SQL/API authorization: network mocks cannot prove RLS.

Dialogs use accessible name matching `Ayuda`; exact button/text labels follow the approved Spanish flow. A navigation target is checked by heading, viewport and focus, not a newly invented anchor ID. Visual baseline is the existing institutional portal font/layout; no new visual system is defined here.

### Coverage and execution limits

| Approved cases | Authored checks | What has actually been exercised |
|---|---|---|
| F01-F06 | Home/greeting/buttons and both topic menus, exact orientation copy and view actions | Student portal loads; browser then stops at missing Ayuda |
| F07-F10 | Home/close from menu, guidance, success, empty, error/loading; reopen reset; detail/menu back; section controls | Authored downstream, not reached before launcher exists |
| D01-D04/D08-D09 | Valid active multi-year transport, two sports, route number/group/year, inactive exclusion | Real repository PASS except D03 RED; chat rendering not reached |
| D05-D06 | Array/null/empty joins, missing fields, no undefined/null UI | Existing mapper safe-join characterization PASS; “No informado” UI not reached |
| D07/D10 | Empty collection vs missing linked student | Existing mapper PASS; distinct chat messages/navigation not reached |
| D11-D13 | Escaped HTML, own-topic fields only, no action promising enrollment/capacity | Authored browser checks not reached |
| Q01-Q04 | No additional reads for static screens, topic-only query, loading announcement and duplicate prevention | Authored browser checks not reached |
| Q05-Q08 | HTTP/network errors distinct from empty; repeated failure and successful retry | Repository rejection PASS; browser recovery not reached |
| Q09-Q11 | Topic failure isolation, stale home/back/close responses, overlapping transport/sports | Authored browser checks not reached |
| Q12-Q14 | Logout/account switch while pending, expiration before retry, no writes/RPC | Existing auth/repository PASS; live chat cleanup not reached |
| A01-A05 | Real institutional validation, nonstudent redirect, anonymous/demo denial, pending/revoked accounts | Node auth PASS; final browser has six access checks PASS and three role-navigation setup timeouts; student launcher absent in other ready-portal cases |
| N01-N07 | Five destinations from portal/forum, exact focus/scroll and close, missing target/link | Authored browser checks not reached |
| U01-U03 | Keyboard opening, initial focus, expanded state, live region, Escape/focus restoration | Authored browser checks not reached |
| U04-U06 | 360px mobile overflow/close visibility, inherited font, button-only UI and no persisted service PII | Authored browser checks not reached |

**Explicit limits:** U05 checks inherited font and responsive layout, not a pixel/color baseline or manual design review. Mobile uses a 360×640 viewport in Chromium, not physical devices or every browser. Keyboard checks reach all initial controls with visible focus, exercise reverse Tab and Escape; they do not audit every future dialog screen. No service-key/RLS conclusion may be inferred from this frontend harness.

### Environment notes

- Initial install of Playwright 1.58.2 failed certificate verification, including with Node system CA. TLS verification was never disabled. Exact Playwright 1.62.1 was available in the verified npm cache and installed offline, with its existing Chromium 1234 cache. The lockfile pins the reproducible dependency.
- The dev server's module requests did not complete inside the initial 15/30 second smoke windows. The harness now builds with test-only env and uses `vite preview`; a corrected smoke reaches the real authenticated portal. Initial startup failures were setup BLOCKED, not product RED.
- Browser JSON results and failure traces are ignored under `test-results/`. They contain synthetic data only. Tests exit nonzero until the approved UI exists; Step 1 does not claim production readiness.
- Type checking is enabled for the JavaScript tests via a local jsconfig. The `punycode` mapping resolves Node's existing legacy declaration rather than type-checking the third-party implementation through TypeScript 6 module resolution.

Rollback of browser unit: remove browser tests, local jsconfig, Playwright config/dependency/lock additions, added test scripts, test lint scope and artifact ignore rules. Unit characterization tests remain independently runnable. No production source or backend behavior is affected.

## Historical verification before independent audit (2026-10-26)

| Command | Result |
|---|---|
| `npm run test:chatbot:check` | PASS: JavaScript checkJs and scoped ESLint |
| `npm run test:existing` | 4 PASS |
| `npm run test:chatbot:unit` | 22 total: 21 PASS, 1 RED (D03 lost route number); exit 1 |
| `node node_modules/@playwright/test/cli.js test` | 87 total: 6 PASS, 76 behavioral RED, 5 setup BLOCKED; process reports 81 failures and exits 1; 6.9 minutes |
| `npm run build` / browser preflight build | PASS; existing large-chunk warning remains |
| `npm run lint` | Same baseline 4 errors / 4 warnings, no new test/config diagnostics |
| `git diff 468bf69..HEAD --check` | PASS after the two frontend test commits |

In that historical snapshot, the 76 RED browser cases reach the authenticated student portal and then fail at the missing `Ayuda` launcher. Their later assertions are **authored but not reached**, not 76 independently demonstrated chatbot defects. The five setup blocks time out during `page.goto` before DOMContentLoaded: parent/teacher/superadmin exclusion, personalized home, and transport guidance. They are not product RED. The six passing browser cases are unknown-role exclusion, anonymous/demo denial, inactive/suspended denial and pending-auth non-display. The earlier bounded smoke passed all four nonstudent roles and reproduced absent Ayuda; that historical smoke does not erase the historical full-run setup blocks.

Failure JSON/traces remain local and ignored. Do not report this step as a working chatbot or a completely verified frontend matrix. Its delivered artifact is a runnable, test-only contract with explicit RED and environment boundaries.

## Bounded correction after independent audit

The audit found that an existing administrator setup operation uses `POST /rest/v1/rpc/list_enrollment_requests`, a SELECT-only RPC, not a chatbot write. The network fixture permits **only that exact POST and GET /rest/v1/courses for superadmin setup**. Unknown RPCs and all service mutations remain rejected. The prior full-run snapshot above does not describe the corrected candidate.

Added the actual F05 edge (transport guidance → Ver mi transporte) and corrected the direct-view test label. Added transport/sports × success/empty result actions to verify that Ver mis servicios closes the dialog and focuses/scrolls to Servicios activos. Q12 now registers request completion/failure before logout/account switch, waits after release, validates Bruno's greeting, then checks that Ana's identity/service data are absent. Expiration-before-retry remains a separate scenario. No sleeps or production changes were added.

The corrected candidate lists **92 browser tests**. Its targeted smoke deliberately covers only role setup, personalized home, F05, result-navigation and Q12—not another full-suite run. Rollback of this correction removes only these added edge assertions and the narrow read-RPC exception; it does not remove the original test harness.

The first correction smoke had 2 PASS, 9 missing-Ayuda RED and 1 fixture block: the now-permitted administrator read RPC revealed an existing GET courses baseline dependency. After explicit scope confirmation, the actual `EnrollmentRequestsPage.fetchData`, `AdminLayout` and `academicRepository.listCourses` callers were inspected; they require the two named baseline operations above and profile authentication. The courses response is narrowly role/path/method-scoped and returns valid empty rows. This is test setup, not a new chatbot capability.

### Corrected candidate verification

| Command | Observed result |
|---|---|
| `npm run test:chatbot:check` | PASS (checkJs and scoped ESLint) |
| `npm run test:chatbot:unit` | 21 PASS / 1 genuine RED (route number); unchanged unit source |
| `node node_modules/@playwright/test/cli.js test --list` | 92 tests in two browser spec files |
| `node node_modules/@playwright/test/cli.js test --grep "personalized button-only home\|verified (parent\|teacher\|superadmin) account\|F05:\|result -> Ver mis servicios\|Q12" --workers=1` | 12 selected: 3 PASS (parent/teacher/superadmin), 9 RED at missing Ayuda; 0 setup blocks, 0 skipped; 1.7 minutes |
| `git diff 468bf69..HEAD --check` | PASS after the correction commit |

The grep above uses `|` as regular-expression alternation (backslashes shown in the Markdown table only escape its table separators). The nine later student-flow assertions—including newly added F05/result actions and Q12 stale-response assertions—remain authored but not reached because Ayuda is absent. No corrected full-suite count or chatbot implementation success is claimed. Backend API/pgTAP environment limitations are unchanged by this frontend-only correction.

## Pure conversation definitions

`src/features/chatbot/chatbotFlow.ts` defines exactly eight views, their approved Spanish copy/buttons, and pure transitions. `getChatScreen(view, studentName)` uses the supplied name (trimmed, with “estudiante” fallback); it never looks up an account. `transitionChat(view, action)` accepts only actions offered by the current screen. Unknown actions retain the view with no effect.

Effects **declare** a service lookup, close or allowlisted navigation; they never execute network, router, auth, storage or DOM operations. Navigation resets the view to home and declares that the panel closes. Sections currently have exact headings, not anchor IDs: a future navigation adapter must resolve/focus the declared pathname + semantic section + heading, or later add stable anchors. Service result loading/empty/error presentation remains outside the eight conversation views. The UI renderer must render the supplied greeting as text, not HTML.

### TDD evidence and commands

| Stage / command | Observed result |
|---|---|
| Initial importable inert implementation + focused tests | 48 total: 9 PASS / 39 behavioral assertion failures; exit 1, no missing-module failure |
| `node --experimental-vm-modules --test tests/chatbot/flow.test.mjs` | Final 49 PASS / 0 failures |
| `npm run test:chatbot:check` | PASS, including new JavaScript test checkJs |
| `npm run test:existing` | 4 PASS |
| `npm run test:chatbot:unit` | 71 total: 70 PASS / 1 existing RED (repository drops route number) |
| `npm run build` | PASS; existing bundle-size warning |
| `npx eslint src/features/chatbot/chatbotFlow.ts tests/chatbot/flow.test.mjs` | PASS |
| `git diff 38e6b0c..HEAD --check` | PASS after the pure-flow commit |

The 49 focused cases cover all eight definitions, exact buttons/copy, valid edges, home/back/close, lookup/navigation separation, rejected arbitrary navigation, greeting handling, determinism and consumer mutation isolation. Existing unit discovery already includes this file; no package or dependency changes were needed. Browser/backend suites were not rerun because this phase adds no component or service. Their historical RED/setup limitations are not claimed resolved.

Runtime harness: the actual pure module is transpiled and executed in an empty VM context; dependency imports are rejected. Rollback boundary: remove only the pure module, `flow.test.mjs`, and this section. Existing auth/repository/browser contracts remain intact.

## Isolated responsive window (Step 3)

`StudentChatbot.tsx` is a real React component, **not mounted in App or StudentPortalLayout**. It imports only React/ReactDOM, existing Lucide icons and the pure conversation flow. No Supabase, router, authentication, storage or network calls are added.

### Future host integration contract

| Prop | Responsibility |
|---|---|
| `studentName` | Display name supplied by the validated host; React renders it as text. |
| `accountId` | Stable identity for reset/unmount isolation, **not authorization**. Host must validate student-only access. |
| `onLookup(topic, signal)` | Typed async callback returning `{ topic: 'transport', items: ChatTransportAssignment[] }` or `{ topic: 'sports', items: ChatSportAssignment[] }`. Future adapter performs authorized reads and filters active own assignments. |
| `onNavigate(target)` | Receives only the pure flow's typed allowlisted destination, after panel close/reset has committed. Future host executes routing and section focus. |

Transport fields are `id`, optional `routeName`, `routeNumber`, `stop`, `academicYear`; sports use `id`, optional `sport`, `group`, `academicYear`. Missing/null/blank display fields show “No informado”. Empty and error states remain distinct. Results contain no arbitrary HTML, catalog/capacity claims or write actions.

The window is a named **nonmodal** dialog: no focus trap, keyboard focus on opening, Escape/focus restoration, live loading status and alert errors. Its navy/cream/teal palette and inherited typography match the student portal. Only the body scrolls; global controls stay visible. Account changes create a fresh keyed instance; home/back/close/navigation/unmount abort and invalidate requests. A synchronous pending ref deduplicates rapid calls, while a request revision also rejects late callbacks that ignore cancellation. `flushSync` is limited to closing before the external navigation callback; it follows the official React event-handler integration contract.

### Verification and TDD evidence

| Command / check | Observed result |
|---|---|
| Initial real component smoke with an importable inert launcher | 1 behavioral RED: launcher clicks but no named dialog appears; not a missing-module failure |
| `npm run test:chatbot:component` | 18 PASS, 0 failures/skips; actual React component in isolated build+preview fixture |
| `node --experimental-vm-modules --test tests/chatbot/flow.test.mjs` | 49 PASS |
| `npm run test:chatbot:check` | PASS, including component fixture type checking and scoped test lint |
| `npm run test:existing` | 4 PASS |
| `npm run test:chatbot:unit` | 70 PASS / 1 existing route-number RED; no unit expectations weakened |
| `npm run build` and scoped component/harness ESLint | PASS; existing large-bundle warning |
| Global `npm run lint` | Existing 4 errors / 4 warnings, no new diagnostics |
| `git diff 9058c0b..HEAD --check` | PASS after the component commit |

The isolated fixture imports the actual component and injects controllable test-only callbacks. It does not copy/render a fake chatbot and never calls production services. Initial fixture startup had an incorrect nested working directory, corrected before the behavioral RED observation. The first full component pass exposed Escape after a focused menu button disappeared and incorrectly hidden section-services navigation; both were fixed and the final 18 cases pass. Tests cover lifecycle resets, late replies including ignored aborts, dedup/retry, success/empty/missing fields/XSS, navigation ordering, keyboard focus and 390px/desktop layout. They use actual callback resolution and commit synchronization, not sleeps.

Ignored preview PNGs: `test-results/chatbot-desktop.png` and `test-results/chatbot-mobile.png`. The original 92 application-level browser contracts are untouched and remain unmounted/RED; backend/API environment limitations and authorization requirements are unchanged. Neither suite was rerun for this isolated component step.

Rollback boundary: remove `StudentChatbot.tsx`, `tests/chatbot/component`, the component test script/type-check addition, and this section. The pure flow, previous unit/browser contracts and application routing remain unchanged. No new dependency was installed.

## Authenticated personal-service reads (Step 4)

Public API: `lookupStudentChatbotServices(topic, signal)` in `src/features/chatbot/chatbotRepository.ts`. It is compatible with the component's `onLookup` callback but is **not wired to the application yet**. It accepts only `'transport' | 'sports'` and an `AbortSignal`, never a caller-supplied profile/student ID. Shared DTOs now live in `chatbotTypes.ts`, outside React; component type reexports preserve existing consumers.

The adapter validates the real Supabase account through `auth.getUser`, an active known student profile and an active profile→person→student link. Missing links are not successful empty results. Multiple active student links fail closed rather than selecting an arbitrary first row. Topic readers reuse the existing student repository, select only that student's active assignments and retain active prior-year labels. They do not load courses, grades, dining, the other service topic or the eager portal aggregate. Object/array/null joins normalize safely. The shared transport mapper preserves route name **and** route number (including zero); the old D03 regression is now GREEN, with the portal's existing name/detail fields unchanged.

### Errors and cancellation

All `ChatbotRepositoryError` messages are fixed, safe UI copy without SDK error text, tokens or logs.

| Code | Meaning |
|---|---|
| `SESSION_REQUIRED` | Missing/invalid authentication, missing profile or inactive/unrecognized account. |
| `STUDENT_REQUIRED` | Valid account belongs to a known nonstudent role. |
| `LINKAGE_REQUIRED` | No active person/student link; distinct from no enrollments. |
| `LINKAGE_AMBIGUOUS` | More than one active student link; no arbitrary selection. |
| `QUERY_FAILED` | Auth/profile/identity/service SDK or network failure, never an empty success. |
| `SESSION_CHANGED` | Post-read authentication/role/student identity differs or is revoked. |
| `INVALID_TOPIC` | Unsupported runtime topic/identity payload; rejected before reads. |
| `ABORTED` | Caller cancellation; error name is `AbortError`. |

`getSupabaseAccountSession({ strict: true, signal })` is opt-in: safe query failures become errors for this adapter, while existing no-option callers keep their previous null/error behavior. The authoritative user is still obtained from `getUser`, not local session metadata or demo roles. A local session token alone never grants access.

The signal is propagated to supported PostgREST `.abortSignal` queries and checked before/after awaited stages. Auth SDK operations are checked around their awaits; their transport is not claimed cancellable. After a service response, server-auth/profile and active linkage are read again before returning results, rejecting logout, A→B, role/profile revocation or changed student linkage. There is no persistent cache, auth-event subscription or host-session integration in this step. This is request-bound revalidation, not a substitute for backend RLS or the future host's live account lifecycle.

### TDD and verification

| Command / evidence | Observed result |
|---|---|
| Importable inert adapter, bounded RED smoke (`--test-name-pattern 'validates real auth\|cannot read services\|route number zero'`) | 15 behavioral assertion failures, 0 cancellations; no missing-module failure |
| `node --experimental-vm-modules --test tests/chatbot/lookup.test.mjs` | 52 PASS / 0 failures or cancellations |
| `npm run test:chatbot:unit` | 123 PASS; includes all previous 71 plus 52 new adapter checks; former route-number RED resolved |
| `node --experimental-vm-modules --test tests/chatbot/flow.test.mjs` | 49 PASS |
| `npm run test:chatbot:check` | PASS |
| `npm run test:existing` | 4 PASS |
| `npm run test:chatbot:component` | 18 PASS after DTO extraction |
| `npm run build` and scoped changed-source/test ESLint | PASS; existing large-bundle warning |
| Global `npm run lint` | Existing 4 errors / 4 warnings; no new diagnostics |
| `git diff 55b3fed..HEAD --check` | PASS after the service-adapter commit |

The first unrestricted inert-adapter run also had seven cancelled pending-query cases because the inert implementation never started those queries; these were not claimed product RED. The bounded smoke above established assertion-based RED before implementation, and the final full focused suite has no cancelled/skipped cases.

Tests execute actual auth/repository/adapter modules in a VM with only the Supabase boundary mocked. They cover derived identity, active filters, topic isolation, safe joins, past years, route zero/null, strict-vs-legacy auth behavior, errors vs empty, abort and mid-query account/role/profile/person/student-link changes. The boundary exposes no write/RPC methods. **These tests do not prove database RLS**; no backend/API suite was rerun. The existing application browser suite remains unmounted/integration-RED, not executed here.

Rollback boundary: remove `chatbotRepository.ts`/new lookup tests and this section; restore the previous component DTO declarations, optional auth strict mode and topic-reader additions. Reverting the shared transport mapping would intentionally restore the previous D03 regression. No App/layout mount, navigation adapter, backend/schema/policy or dependency changes were made.
