## ADDED Requirements

### Requirement: Release SHALL remain blocked until DeepSeek API and CloudBase hosting preflight pass

The AI provider SHALL be the direct DeepSeek OpenAI-compatible API. Before AI implementation or release, evidence SHALL record:

1. the authenticated `https://platform.deepseek.com/usage` page shows usable account balance/credits, with financial/account details redacted;
2. a `DEEPSEEK_API_KEY` is present in the server secret configuration and absent from every client-visible or recorded artifact;
3. the configured endpoint is exactly `https://api.deepseek.com/chat/completions` and the model is exactly `deepseek-v4-flash` with thinking disabled;
4. a minimal sanitized non-streaming JSON smoke request returns HTTP 200, `finish_reason: "stop"`, valid JSON, and `usage.total_tokens > 0`;
5. the official DeepSeek pricing/model page is captured with timestamp for release-cost provenance;
6. CloudBase EnvId `cloud1-d7gxdk8t43bd639c0` is normal, existing Static Hosting is recorded, and independent Web App service `trae-h5-demo` remains the deployment target.

CloudBase Token Credits, `DescribeAIModels`, `DescribeManagedAIModelList`, and `UpdateAIModel` SHALL NOT be required. Offline or deterministic fallback SHALL NOT satisfy the DeepSeek smoke gate.

#### Scenario: Missing or invalid DeepSeek key blocks release

- **WHEN** the server key is absent or the smoke request returns HTTP 401
- **THEN** release evidence records BLOCKED without exposing the key or Authorization header
- **AND** no AI-ready or release-ready claim is made

#### Scenario: Insufficient DeepSeek balance blocks release

- **WHEN** the usage page has no usable balance or the smoke request returns HTTP 402
- **THEN** release evidence records BLOCKED and points the owner to the DeepSeek usage/top-up page

#### Scenario: DeepSeek preflight passes

- **WHEN** the funded account, protected server secret, exact model/configuration, and positive-token smoke result are all evidenced
- **THEN** direct DeepSeek enhancement may be enabled for online release

### Requirement: Guest plan generation SHALL have bounded spoof-resistant rate limiting

`POST /community-plan/generate` SHALL apply a guest limit of 10 requests per 60-second sliding window. It SHALL resolve the source through `ctx.ip` and explicit trusted-proxy configuration; raw `X-Forwarded-For` SHALL be ignored when the sender is not trusted. IPv4/IPv6 forms SHALL be normalized. Buckets SHALL expire after two minutes, and the in-memory map SHALL be capped at 10,000 entries with deterministic oldest-expiry eviction.

All generation responses SHALL include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Exhaustion SHALL return HTTP 429 and `RATE_LIMITED` in the existing standard error envelope. Multi-instance consistency remains a documented MVP limitation.

#### Scenario: Eleventh guest request is limited

- **WHEN** the same resolved source sends 11 requests inside 60 seconds
- **THEN** the eleventh returns `429 RATE_LIMITED`
- **AND** remaining is zero

#### Scenario: Spoofed forwarding header does not bypass the limit

- **WHEN** an untrusted client changes `X-Forwarded-For` between requests
- **THEN** the limiter continues to use the trusted resolved source
- **AND** the request series is still limited

#### Scenario: Limiter memory is bounded

- **WHEN** expired buckets or more than 10,000 distinct sources are introduced
- **THEN** expired/oldest-expiry entries are removed
- **AND** the bucket map never grows beyond the configured cap

### Requirement: Release tests SHALL prove guest write denial and privacy boundaries

Security tests SHALL exercise representative guest writes across events, discover, files, places, auth/preferences, notifications, and admin and prove `403` with no provider mutation. Privacy tests SHALL prove guest preferences, plans, visit state, and Demo Confirm are not persisted. DeepSeek requests and logs SHALL exclude `accessibility_needs`, complete preferences, free text, contact data, detail projections, and admin fields. Logs and non-UI evidence SHALL additionally exclude the API key, Authorization header, prompts, raw generated output, and raw DeepSeek responses. GUI screenshots MAY contain only the validated narration rendered by the product UI and SHALL NOT expose raw upstream payloads, prompts, model-debug views, or unvalidated output.

#### Scenario: Guest cannot mutate any existing business module

- **WHEN** the security suite sends guest-authenticated write requests to every scoped route family
- **THEN** each receives `403 FORBIDDEN`
- **AND** before/after provider state is identical

#### Scenario: Sensitive values are absent from AI and logs

- **WHEN** generation runs with every preference option populated and AI succeeds or fails
- **THEN** captured model input and structured logs contain only the documented allowlist
- **AND** no accessibility value, PII, API key/Authorization value, prompt/output text, detail field, or admin field is present

### Requirement: Generation observability SHALL be useful without logging content

Each generation SHALL log `requestId`, actor kind, fixed community ID, generation source, AI status, duration, timestamp, provider `deepseek`, model `deepseek-v4-flash`, upstream HTTP status category, and successful token total when present. Fallback logs SHALL record only the stable failure category. The public response SHALL retain the standard success/error envelope and request ID.

#### Scenario: AI success has correlated metadata

- **WHEN** a live AI generation succeeds
- **THEN** a structured log contains request ID, `ai_enhanced`, `ok`, duration, provider `deepseek`, model `deepseek-v4-flash`, and positive token total
- **AND** it contains no generated narration or preferences

#### Scenario: AI failure has a stable category

- **WHEN** timeout, validation failure, upstream error, or unavailable configuration occurs
- **THEN** the log records the corresponding stable AI status and request ID
- **AND** it does not record raw exceptions or upstream bodies as user-visible content

### Requirement: Online AI and offline Demo acceptance SHALL be separate hard gates

The online acceptance run SHALL use the public HTTP API, with offline fallback disabled for the assertion, and SHALL prove a real DeepSeek-backed 2xx `/community-plan/generate` response containing `generation_source: "ai_enhanced"`, `ai_status: "ok"`, and `usage.total_tokens > 0`. Correlated sanitized logs SHALL identify provider `deepseek` and model `deepseek-v4-flash`. It SHALL then complete the canonical H5 state machine within 180 seconds and show `1/1` visited place plus `1/1` Demo Confirm.

The offline acceptance run SHALL block network/API access, load the bundled safe fixture, display the localized offline badge, and complete the same local actions. It SHALL NOT report `ai_enhanced`, and its evidence SHALL NOT substitute for the online run.

#### Scenario: Online run proves real AI

- **WHEN** the public judge flow generates a plan in online mode
- **THEN** the captured response and correlated log prove AI success and positive token usage
- **AND** no offline badge is visible

#### Scenario: Offline run proves decoupled resilience

- **WHEN** network access is unavailable
- **THEN** the full local judge path completes from the safe bundle with an offline badge
- **AND** the result is explicitly recorded as offline rather than AI success

#### Scenario: Rule-based fallback cannot pass online gate

- **WHEN** the online response uses `rule_based` or `rule_based_fallback`, or token usage is absent/non-positive
- **THEN** the online release gate fails even if the UI remains usable

### Requirement: H5 SHALL deploy as independent CloudBase Web App without changing Admin hosting

The production H5 artifact SHALL be deployed through CloudBase Web Apps with service name `trae-h5-demo`, producing a platform-returned independent URL under the Web Apps domain. Deployment SHALL NOT use, overwrite, clear, or remount the environment's existing shared Static Hosting at `cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com`.

Before and after deployment, evidence SHALL record the existing Static Hosting URL/configuration and representative Admin content checks. It SHALL also record the returned `trae-h5-demo` URL, version/build ID, API base URL, rollback action, and successful access from an external network.

#### Scenario: Independent service is deployed

- **WHEN** the H5 is deployed
- **THEN** CloudBase Web Apps lists service `trae-h5-demo` with a successful version and public URL
- **AND** the H5 loads from that independent URL

#### Scenario: Existing Admin hosting is unchanged

- **WHEN** pre/post hosting evidence is compared
- **THEN** the existing shared hosting URL/configuration and representative Admin content remain available
- **AND** no Admin file was replaced by the H5 deployment

### Requirement: Release SHALL verify H5, Mini Program, tests, contracts, and scope

Before release sign-off, `pnpm typecheck`, `pnpm test`, `pnpm lint`, the Mobile H5 production build, the mp-weixin production build, and `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` SHALL exit successfully. A task-format check SHALL prove each checkbox has one unique `[#R<n>]`, a dot-numbered task ID, `ACCEPT`, `TEST`, and `SCOPE`. New source SHALL not use `any`, `as any`, `@ts-ignore`, or `@ts-nocheck` to bypass typing.

Focused tests SHALL cover schema invariants, safe projection forbidden fields, guest denial, IP spoofing/bounds, DeepSeek 200 success, HTTP 400/401/402/422/429/500/503 mappings, timeout/abort/late response, empty/non-stop/invalid JSON output, secret leakage, client 4xx localization, offline selection, unavailable place handling, catalog parity, H5 state transitions, and both builds.

#### Scenario: Full local gate passes

- **WHEN** all documented commands and focused assertions run
- **THEN** every command exits zero and all required scenarios pass

#### Scenario: Mini Program build is regression-only

- **WHEN** mp-weixin acceptance is reviewed
- **THEN** a successful build and localized H5-only placeholder are required
- **AND** no Mini Program onboarding/map functionality is claimed

### Requirement: Evidence SHALL be append-only and supervisor-verifiable

Every task SHALL receive a new immutable run folder under `auto_test_openspec/launch-trae-competition-h5-demo/` using the format required by `openspec/project.md`. Worker bundles SHALL not declare PASS/FAIL. The Supervisor SHALL execute the bundle, record exact commands/exit codes, and write final PASS/FAIL plus evidence pointers. GUI/MIXED checks SHALL use an MCP-only browser runbook and screenshots; executable browser automation scripts are prohibited.

Evidence SHALL include timestamp, commit, environment ID, service URL/build ID, request IDs, redacted DeepSeek usage/pricing provenance, sanitized logs, input/output assertions, screenshots, online/offline mode, and final release sign-off. It SHALL never include `DEEPSEEK_API_KEY`, Authorization headers, or key fragments. Prior run folders SHALL never be edited.

#### Scenario: Every task has immutable evidence

- **WHEN** release sign-off is attempted
- **THEN** each of the nine tasks has a corresponding new run folder with required files and Supervisor result
- **AND** no previous run folder has changed

#### Scenario: Evidence identifies online and offline modes

- **WHEN** online and offline screenshots/logs are reviewed
- **THEN** each artifact identifies its mode and correlated request/build information
- **AND** offline artifacts are not cited as proof of live AI

### Requirement: Competition documentation SHALL identify this change as canonical

`docs/competition/design/DESIGN.md`, `docs/competition/design/screen-flow.md`, and `docs/competition/demo-script.md` SHALL receive clear supersession notes pointing to this change for implementation scope. The implementation/runbook documentation SHALL identify direct server-side DeepSeek API, `deepseek-v4-flash`, secret handling, usage/balance check, and error/fallback mappings, and SHALL remove CloudBase Token Credits/model setup instructions. The demo script SHALL use the canonical Start → preferences → plan → route list → place visit → Demo Confirm → Finish Route → completion sequence. Older “no routes/no mobile changes” constraints SHALL be explicitly superseded, while the approved visual tokens remain reusable.

#### Scenario: Old implementation constraints cannot override this change

- **WHEN** the competition documents are read
- **THEN** they identify this OpenSpec change as the implementation source of truth
- **AND** the old module-tour path is not the primary judge script
