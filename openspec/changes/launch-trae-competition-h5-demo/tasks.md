## 1. External DeepSeek API and CloudBase hosting preflight

- [ ] 1.1 Complete DeepSeek API/account and independent Web App preflight [#R1]
  - ACCEPT: Record a redacted authenticated DeepSeek usage/balance check, timestamped official model/pricing page, and a sanitized direct smoke request to `POST https://api.deepseek.com/chat/completions` using server-only `DEEPSEEK_API_KEY`, model `deepseek-v4-flash`, thinking disabled, non-streaming JSON Output, and positive token usage. HTTP 401/402, missing key, invalid JSON, or non-positive usage keeps the task incomplete. Prove the key/Authorization header is absent from client assets and evidence. Separately record CloudBase `envQuery(action=info)`, `queryApps(listApps)`, and `queryHosting(websiteConfig)` for EnvId `cloud1-d7gxdk8t43bd639c0`, plus `COMMUNITY_PLAN_DEMO_EVENT_ID`, existing Static Hosting, and planned Web App `trae-h5-demo`. Do not require or configure CloudBase Token Credits/managed AI.
  - TEST: SCOPE: CLI
    - When complete, create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/` with sanitized DeepSeek smoke/usage/pricing evidence and CloudBase read-only responses in `inputs/`, machine-decidable assertions in `tests/`, and `outputs/result.json`; never store the key or Authorization header.
    - `task.md` SHALL list the exact redacted DeepSeek and CloudBase checks, expected HTTP/model/finish/JSON/usage predicates, secret scan, existing-hosting snapshot, and both platform commands for validating recorded JSON; `run.sh`/`run.bat` SHALL fail unless every predicate passes.
  - BUNDLE (RUN #1): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #1): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 2. Shared schemas and contracts

- [ ] 2.1 Define strict schemas, POST contract, safe projections, and canonical offline fixture types [#R2]
  - ACCEPT: Add strict shared preference input without `community_id`/PII/free text; discriminated `place_visit|event_attend` items; unique-ID, ordering, non-overlap, item-end, duration-sum, exact-120, and usage invariants; strict AI narration allowlist/length/ID-set schemas; exact place/event public-safe projections; strict offline bundle; `RATE_LIMITED`; and only `POST /community-plan/generate`. No plan detail GET, `activity`, persistence, completion write, capacity field, detail/admin field, or duplicated app-local DTO is introduced. Export all shared definitions and canonical fixtures needed by downstream layers.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-2.1__ref-R2__<YYYYMMDDThhmmssZ>/` with valid/invalid preference, plan, AI, projection, and bundle samples under `inputs/`; write real parse outputs to `outputs/` and compare with `expected/` or rule assertions.
    - `run.sh`/`run.bat` SHALL run focused shared tests plus `pnpm --filter @community-map/shared typecheck`; assert unknown-key/community/PII rejection, type/ref mismatch, duplicate IDs, overlap/overtime/inconsistent totals, forbidden-field leakage, absent detail GET, and positive AI usage semantics.
  - BUNDLE (RUN #2): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-2.1__ref-R2__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #2): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 3. API, provider, guest security, and AI

- [x] 3.1 Implement guest-only Community Plan API after shared contracts and R1 preflight pass [#R3]
  - ACCEPT: Add API-internal guest request actor with `authenticatedVia: "guest"` and no shared guest role; allow guest public reads plus only `POST /community-plan/generate`; deny all other guest writes globally; allow `x-guest-mode` in CORS. Inject `tongzilin`, use provider public-safe projections, deterministically select one published place plus configured curated event, and never query/register capacity. Implement a server-only DeepSeek adapter with Node 20 `fetch`/`AbortController`, exact endpoint/model, thinking disabled, non-streaming JSON Output, `max_tokens: 1024`, strict narration validation, 8s timeout, no request-path retry, cancellation/late-result guard, and unchanged deterministic fallback. Map 401/402/missing key to unavailable; map 400/422/429/500/503/network to upstream error; map empty/non-stop/invalid output to validation failure. Add spoof-resistant 10/min guest limiter with trusted-proxy resolution, two-minute expiry, 10,000-bucket cap, standard headers/envelope, and logs that never expose the key, Authorization header, prompt, output, or raw response.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-3.1__ref-R3__<YYYYMMDDThhmmssZ>/` with request/dataset/AI/rate-limit/log inputs and asserted JSON outputs.
    - `run.sh`/`run.bat` SHALL run focused API tests and API typecheck. Cover guest 403 with unchanged provider state for events/discover/files/places/auth/notifications/admin; deterministic two-item plan; draft/cross-community exclusion; missing curated event configuration; DeepSeek success; timeout/abort plus late result; HTTP 400/401/402/422/429/500/503; empty content/non-stop finish; invalid JSON; missing/extra/duplicate IDs; key/Authorization leakage; accessibility/prompt/output absence; spoofed XFF; cleanup/cap; rate-limit headers; and standard request IDs.
  - BUNDLE (RUN #3): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-3.1__ref-R3__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #3): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 4. Shared and mobile clients

- [ ] 4.1 Implement shared HTTP/mock clients and the mobile offline adapter after API/provider behavior is stable [#R4]
  - ACCEPT: Extend `CommunityMapApiClient`, mock client, and HTTP client with only `communityPlan.generate`; preserve the standard envelope/request ID and guest header rules. Add a mobile adapter that consumes shared types, maps 400/403/404/409/429 stable codes to catalog keys, selects the strict offline bundle only in mock mode or on transport/DNS/timeout/5xx, and exposes no offline behavior as an API/provider method. Ensure offline snapshots and route summaries use allowlisted safe projections and that place-detail 404 can produce local unavailable state without swallowing other 4xx responses.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-4.1__ref-R4__<YYYYMMDDThhmmssZ>/` with HTTP envelopes, transport failures, 4xx/5xx cases, and safe bundles under `inputs/`; write adapter decisions to `outputs/` with expected/rule assertions.
    - `run.sh`/`run.bat` SHALL run focused shared/mobile client tests and both affected package typechecks; assert exact POST wiring, guest header without bearer/mock actor, no detail method, 4xx localization without offline fallback, transport/5xx offline selection, offline badge state, and forbidden-field absence.
  - BUNDLE (RUN #4): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-4.1__ref-R4__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #4): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 5. H5 judge experience and Mini Program boundary

- [ ] 5.1 Build the deterministic H5 state machine, bilingual UI, route-list baseline, and optional map enhancement [#R5]
  - ACCEPT: Register welcome, preferences, plan, route-map, and complete pages outside tabBar; use the existing reactive-store pattern or equivalent memory-only store without persistence. Implement exact transitions Start → Generate → plan → Open Route/list → place detail → Mark Visited → local Demo Confirm → Finish Route → completion, with Finish disabled until requirements are met and canonical `1/1` results. Render the approved editorial tokens at 390px and centered desktop, central zh/en copy, 44px targets, semantic labels/focus/contrast. Always render marker-safe route list; compile-guard optional H5 Tencent Map SDK and keep list usable on missing/failing SDK. No event registration/availability call or ticket claim. Place 404 becomes unavailable. Refresh/deep link redirects to welcome, Start Over clears all state. MP exposes no entry, shows localized H5-only placeholder on direct route, and contains no H5 DOM leakage.
  - TEST: SCOPE: MIXED
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-5.1__ref-R5__<YYYYMMDDThhmmssZ>/` with `tests/gui_runbook_judge_flow.md` and `tests/gui_runbook_offline_map_a11y.md`; GUI execution SHALL be MCP-only with screenshots, console/request evidence, and no browser automation scripts.
    - `run.sh`/`run.bat` SHALL be start-server only and print the local H5 URL. `task.md` SHALL contain exact separate preparation/typecheck commands, fixture provenance, locales/viewports, SDK success/failure setup, 404 setup, MP placeholder inspection, and machine-decidable CLI assertions; MCP evidence SHALL prove both locales, exact state transitions, no registration request, route-list safety, offline badge, reset/refresh behavior, accessibility, and completion within 180 seconds.
  - BUNDLE (RUN #5): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-5.1__ref-R5__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #5): PENDING | VALIDATED: (Supervisor records commands, exit codes, and MCP steps) | RESULT: PASS|FAIL | GUI_EVIDENCE: outputs/screenshots/ and logs/screenshots-index.*

## 6. Competition documentation and runbooks

- [ ] 6.1 Update supersession notes, environment/runbook documentation, privacy boundary, and judge script [#R6]
  - ACCEPT: Update the competition design/screen-flow/demo-script and implemented-API/environment documentation during implementation. Identify this change as canonical for functionality while retaining approved visual tokens. Document direct server-side DeepSeek API, `DEEPSEEK_API_KEY` secret handling, exact endpoint/model/non-thinking JSON request, usage/balance smoke gate, current official pricing source, HTTP failure mappings, curated event ID, guest/write denial, safe projection fields, timeout/fallback behavior, rate-limit trust/memory limits, H5 optional-map and MP boundaries, independent `trae-h5-demo` deployment/rollback, separate online/offline acceptance, and the exact <=180s judge script. Remove CloudBase Token Credits/model setup plus authenticated plan, detail GET, activity item, real registration/full-event, and mandatory map claims from launch instructions.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-6.1__ref-R6__<YYYYMMDDThhmmssZ>/` with document assertions and forbidden-stale-claim scans.
    - `run.sh`/`run.bat` SHALL verify supersession links, DeepSeek environment/secret/preflight/error documentation, absence of CloudBase managed-AI instructions, independent Web App service, exact judge transitions, privacy/security/limiter statements, online/offline separation, rollback, and absence of deferred launch claims; write `outputs/result.json`.
  - BUNDLE (RUN #6): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-6.1__ref-R6__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #6): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 7. Local release gate

- [ ] 7.1 Run focused security/privacy/failure tests plus full repository and dual-target validation [#R7]
  - ACCEPT: Focused shared/API/client/mobile tests pass for every required schema, privacy, guest-security, limiter, AI, offline, i18n, session, and target-boundary scenario. `pnpm typecheck`, `pnpm test`, `pnpm lint`, Mobile `build:h5`, Mobile `build:mp-weixin`, and `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` all exit zero. A task-format checker proves nine dot-numbered checkbox lines, exactly one unique `[#R<n>]` per line, and ACCEPT/TEST/SCOPE for every task. New source contains no forbidden type escape.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-7.1__ref-R7__<YYYYMMDDThhmmssZ>/`; `run.sh`/`run.bat` SHALL run the exact commands, capture stdout/stderr/exit codes in `logs/`, and emit a consolidated `outputs/result.json` with rule-based assertions for known-bad patterns and required build artifacts.
    - Inputs SHALL record environment/config provenance without secrets; expected results SHALL derive from this task and the four change specs.
  - BUNDLE (RUN #7): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-7.1__ref-R7__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #7): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A

## 8. Independent deployment and external online/offline acceptance

- [ ] 8.1 Deploy `trae-h5-demo` and prove separate live-AI and offline judge paths externally [#R8]
  - ACCEPT: After R1-R7 pass, deploy the API with server-only `DEEPSEEK_API_KEY` and the H5 artifact as CloudBase Web App service `trae-h5-demo` in `cloud1-d7gxdk8t43bd639c0`; record returned URL, build/version ID, API URL, commit, and rollback without exposing the secret. Capture existing shared Static Hosting/Admin state before and after and prove it is unchanged. From an external network, online mode SHALL return real DeepSeek-backed 2xx generation with `ai_enhanced/ok`, provider/model correlation, and `usage.total_tokens > 0`, no offline badge, then complete the exact `1/1` judge flow in <=180s. A separate network-blocked run SHALL complete from the safe bundle with an offline badge and no AI-success claim. Verify missing map SDK retains route list and refresh/deep links recover safely.
  - TEST: SCOPE: MIXED
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-8.1__ref-R8__<YYYYMMDDThhmmssZ>/` with `tests/gui_runbook_public_online.md` and `tests/gui_runbook_public_offline.md`; GUI checks SHALL be MCP-only and archive screenshots plus request/console indexes.
    - `run.sh`/`run.bat` SHALL be start-server only for the locally built artifact. `task.md` SHALL record exact build/deploy/preparation commands, public URLs, pre/post Admin checks, AI response/log assertions, offline setup, rollback, and evidence destinations. Online fallback or non-positive/missing token usage SHALL fail this gate even when UI fallback works.
  - BUNDLE (RUN #8): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-8.1__ref-R8__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #8): PENDING | VALIDATED: (Supervisor records commands, exit codes, deployment, and MCP steps) | RESULT: PASS|FAIL | GUI_EVIDENCE: outputs/screenshots/ and logs/screenshots-index.*

## 9. Append-only evidence and release sign-off

- [ ] 9.1 Verify immutable bundles, privacy redaction, hosting isolation, and final release decision [#R9]
  - ACCEPT: Tasks 1.1 through 8.1 have new immutable run folders with required `task.md`, `run.sh`, `run.bat`, `logs/`, and applicable `tests/inputs/outputs/expected`; each has Supervisor PASS/FAIL, exact commands/exit codes, and evidence pointers. Verify no prior run folder was modified; online/offline artifacts are explicitly separated; logs and non-UI evidence contain no `DEEPSEEK_API_KEY`, Authorization header/key fragment, PII, accessibility values, prompts, raw generated output, detail/admin fields, or raw credentials. GUI screenshots MAY contain only the validated narration rendered by the product UI and SHALL NOT contain raw upstream payloads, prompts, model-debug views, or unvalidated output. The redacted DeepSeek usage/pricing proof, exact provider/model/token evidence, Web App URL/build, unchanged Admin hosting, rollback, commit, timestamp, and final release owner decision are recorded. Release SHALL remain not ready if any earlier task is incomplete or failed.
  - TEST: SCOPE: CLI
    - Create `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-9.1__ref-R9__<YYYYMMDDThhmmssZ>/`; `run.sh`/`run.bat` SHALL validate bundle names/contents, monotonic run numbers, Supervisor results, evidence links, redaction rules, prior-run immutability, online/offline separation, and required release metadata, then write `outputs/result.json`.
    - `task.md` SHALL identify the immutable baseline and exact git/evidence checks; no existing run folder may be edited to make this task pass.
  - BUNDLE (RUN #9): PENDING | VALIDATION_BUNDLE: auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-9.1__ref-R9__<YYYYMMDDThhmmssZ>/ | HOW_TO_RUN: run.sh/run.bat
  - EVIDENCE (RUN #9): PENDING | VALIDATED: (Supervisor records exact commands and exit codes) | RESULT: PASS|FAIL | GUI_EVIDENCE: N/A
