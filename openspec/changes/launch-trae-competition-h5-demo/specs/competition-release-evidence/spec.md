## ADDED Requirements

### Requirement: Release SHALL prove exhaustive catalog coverage

Before release, machine-decidable evidence SHALL prove exactly 21 complete bilingual dimension modules, 576 logical scenarios, 576 unique scenario keys, 1,152 complete localized render cases, zero invalid plans, zero missing catalog copy, and correct selected-module correspondence for every generated reason.

#### Scenario: Coverage gate passes

- **WHEN** the exhaustive shared suite runs
- **THEN** all required counts match exactly
- **AND** every result contains four unique ordered reasons

### Requirement: Online and local matching SHALL have exhaustive semantic parity

Provider/API and local paths SHALL be compared across all 576 profiles using a semantic fingerprint containing scenario key, catalog version, item refs, explanation, summaries, and tips. Request ID and generated timestamp MAY differ.

#### Scenario: Parity gate passes

- **WHEN** all provider and local results are fingerprinted
- **THEN** 576/576 fingerprints match

### Requirement: Competition runtime SHALL be model-free

Current API source, environment configuration, browser traffic, public contracts, frontend artifacts, and user-facing copy SHALL contain no Community Plan model endpoint, model credential, model response field, or product AI-generation claim. The official competition name and clearly marked historical superseded evidence MAY retain AI terminology.

#### Scenario: Model-free audit passes

- **WHEN** current runtime paths and build artifacts are scanned and browser traffic is inspected
- **THEN** no competition Community Plan model request or result field is present

### Requirement: Guest generation SHALL remain bounded and write-safe

`POST /community-plan/generate` SHALL keep the 10-per-60-second trusted-source limiter, standard headers, two-minute expiry, and 10,000-bucket cap. Guest writes across events, discover, files, places, preferences, notifications, and admin SHALL return `403 FORBIDDEN` without mutation.

#### Scenario: Guest security regression passes

- **WHEN** representative writes and 11 generation requests are executed
- **THEN** writes are denied, the eleventh generation is `429 RATE_LIMITED`, and provider state is unchanged

### Requirement: Generation observability SHALL be useful without logging content

Each generation log SHALL contain only request ID, actor kind, fixed community ID, scenario key, catalog version, duration, and timestamp. It SHALL exclude complete preferences, accessibility choice, explanation/item copy, PII, detail/admin fields, credentials, and raw request bodies.

#### Scenario: Privacy-safe log is correlated

- **WHEN** generation succeeds
- **THEN** its request ID, scenario key, and catalog version are available for correlation
- **AND** no excluded content is logged

### Requirement: Online and offline acceptance SHALL be separate

The online run SHALL use the public HTTP API and complete the canonical path within 180 seconds with no offline badge. The offline run SHALL block API access, use the shared local matcher, show the offline badge, and complete the same actions. The selected profile SHALL have matching semantic content in both runs.

#### Scenario: Both public delivery paths pass

- **WHEN** online and blocked-network runbooks execute
- **THEN** both complete with `1/1` visit and `1/1` Demo Confirm
- **AND** their semantic fingerprints match

### Requirement: H5 SHALL deploy independently without changing Admin hosting

The production H5 SHALL deploy as CloudBase Web App `trae-h5-demo`, not over existing shared Static Hosting. Evidence SHALL capture pre/post Admin hosting, returned H5 URL, build/version ID, API URL, commit, external access, and rollback action.

#### Scenario: Hosting isolation is proven

- **WHEN** pre/post evidence is compared
- **THEN** the independent H5 is available and existing Admin content remains unchanged

### Requirement: Release SHALL verify repository and dual-target health

`pnpm typecheck`, `pnpm test`, `pnpm lint`, mobile H5 build, mp-weixin build, and strict OpenSpec validation SHALL exit zero. Focused tests SHALL cover strict contracts, 576 coverage/parity, guest security, limiter bounds, privacy, 4xx/5xx fallback, offline session actions, catalog parity, and target boundaries. New source SHALL not add type-suppression escapes.

#### Scenario: Full local gate passes

- **WHEN** documented release commands run
- **THEN** every command exits zero and required artifacts exist

### Requirement: Evidence SHALL be append-only and supervisor-verifiable

Active tasks R10–R18 SHALL receive new immutable run folders under `auto_test_openspec/launch-trae-competition-h5-demo/`. Historical R1–R9 evidence SHALL remain unchanged and SHALL be labelled superseded rather than reused as current release proof. GUI/MIXED checks SHALL use MCP-only runbooks and screenshots. TRAE session IDs SHALL be copied from TRAE UI and SHALL never be invented.

Evidence status SHALL distinguish `implementation complete`, `worker bundle prepared`, and `supervisor verified`. A checked task or prepared bundle without real outputs/logs and a Supervisor verdict SHALL NOT be treated as release-PASS evidence.

#### Scenario: Active evidence is complete

- **WHEN** release sign-off is attempted
- **THEN** R10–R18 have evidence pointers and Supervisor results
- **AND** no historical run folder or screenshot was modified

### Requirement: Competition documentation SHALL identify the curated version as canonical

Competition design, screen-flow, demo script, API list, environment/runbook, submission draft, and evidence log SHALL describe “桐邻 First 120 Minutes｜社区策展融入路线”, the singular profile, 576 combinations, explainable result, shared online/offline matcher, Demo-only action, and advisory accessibility boundary. Codex review SHALL be described only as supplemental quality review, not TRAE implementation proof.

#### Scenario: Submission claims match runtime

- **WHEN** current competition documents are reviewed
- **THEN** they make no product AI-runtime claim
- **AND** all functional claims map to current specs and evidence
