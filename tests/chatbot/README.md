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

## Frozen final verification (2026-10-26)

| Command | Result |
|---|---|
| `npm run test:chatbot:check` | PASS: JavaScript checkJs and scoped ESLint |
| `npm run test:existing` | 4 PASS |
| `npm run test:chatbot:unit` | 22 total: 21 PASS, 1 RED (D03 lost route number); exit 1 |
| `node node_modules/@playwright/test/cli.js test` | 87 total: 6 PASS, 76 behavioral RED, 5 setup BLOCKED; process reports 81 failures and exits 1; 6.9 minutes |
| `npm run build` / browser preflight build | PASS; existing large-chunk warning remains |
| `npm run lint` | Same baseline 4 errors / 4 warnings, no new test/config diagnostics |
| `git diff 468bf69..HEAD --check` | PASS after the two frontend test commits |

The 76 RED browser cases reach the authenticated student portal and then fail at the missing `Ayuda` launcher. Their later assertions are **authored but not reached**, not 76 independently demonstrated chatbot defects. The five setup blocks time out during `page.goto` before DOMContentLoaded: parent/teacher/superadmin exclusion, personalized home, and transport guidance. They are not product RED and must be rerun in a stable browser environment. The six passing browser cases are unknown-role exclusion, anonymous/demo denial, inactive/suspended denial and pending-auth non-display. The earlier bounded smoke passed all four nonstudent roles and reproduced absent Ayuda; that historical smoke does not erase the final full-run setup blocks.

Failure JSON/traces remain local and ignored. Do not report this step as a working chatbot or a completely verified frontend matrix. Its delivered artifact is a runnable, test-only contract with explicit RED and environment boundaries.
