## Why

The current product exposes places, events, and community content as separate modules, but it does not provide a guided outcome for a first-time resident or a competition judge. The July 15 competition release therefore adds a new guest-only product loop: a judge states a small set of preferences, receives a validated "First 120 Minutes" plan, visits one community place, confirms one clearly labelled demo activity, and reaches an explicit completion result within three minutes.

This is a substantive version iteration rather than a repackaging of existing pages. It introduces a new cross-layer Community Plan contract, deterministic recommendation behavior, server-side AI narration with validated fallback, a protected guest actor, session state, an offline-safe projection, a route experience, and independent public deployment evidence.

## What Changes

- Add a public H5 judge entry that uses a dedicated API-internal guest actor without login or mock-user semantics.
- Add strict shared preference, plan, AI-enhancement, public-safe projection, and offline-bundle schemas for the single `tongzilin` community.
- Add only `POST /community-plan/generate`; the request does not accept `community_id`, and plans are not persisted or retrievable by ID.
- Generate a deterministic two-item, 120-minute plan containing one published place visit and one fixed curated demo event; real registration, tickets, capacity checks, and real-time full-event detection are out of scope.
- Enhance only bilingual plan narration through the server-side DeepSeek API using `deepseek-v4-flash` in non-thinking JSON mode. Timeout, upstream failure, authentication/balance failure, malformed JSON, schema mismatch, or a late response returns the unchanged deterministic plan.
- Add an H5 judge state machine with explicit Start, Generate, Mark Visited, Demo Confirm, Finish Route, completion, and Start Over transitions.
- Make the marker-safe route list the required H5 route capability. Tencent Map JavaScript SDK rendering is an optional enhancement when a key and allowed domain are ready.
- Add an offline demo adapter backed by strict public-safe snapshots and clearly identify offline/fallback results; offline evidence cannot satisfy the live-AI release gate.
- Extend the central mobile bilingual catalog with every onboarding state and API-error mapping.
- Build-regress the WeChat Mini Program, but do not expose the onboarding entry or claim Mini Program functional acceptance.
- Deploy the H5 as the independent CloudBase Web App service `trae-h5-demo`; do not replace or mount over the existing shared Admin Static Hosting.
- Produce separate online-AI and offline validation evidence plus an append-only release sign-off.

## Capabilities

### New Capabilities

- `community-plan-generation`: strict data contracts, deterministic selection, public-safe projections, DeepSeek API narration, and failure fallback.
- `trae-competition-h5-experience`: guest judge entry, preferences, timeline, route list/optional map, place visit, demo event confirmation, completion, offline mode, and H5/MP boundaries.
- `competition-release-evidence`: guest security, rate limiting, privacy, CloudBase preflight, independent deployment, online/offline acceptance, and append-only evidence.

### Modified Capabilities

- `mobile-language-experience`: complete zh/en onboarding copy and stable API/error-code-to-catalog mappings.

## Impact

- `packages/shared`: new schemas, contracts, path, public-safe fixtures, client surface, and `RATE_LIMITED` error code.
- `apps/api`: guest actor enforcement, Community Plan provider/route, deterministic engine, server-only DeepSeek API adapter, fallback, rate limiting, privacy-safe logs, and CORS support.
- `apps/mobile`: five H5 onboarding pages, memory-only session store, HTTP/mock/offline adapters, route list with optional map enhancement, and bilingual catalog additions.
- `apps/admin`: no source changes; its current CloudBase Static Hosting must remain reachable and unchanged.
- `docs/`: competition runbook, environment variables, supersession notes, and the canonical three-minute judge script.
- `auto_test_openspec/`: new immutable validation runs under this change ID only.
- CloudBase: target environment `cloud1-d7gxdk8t43bd639c0`; independent Web App service `trae-h5-demo`.

## July 15 Scope Boundary

Deferred beyond this MVP: authenticated Community Plan flows, saved preferences, plan persistence/detail GET, `activity` plan items, real event registration/tickets/capacity, Admin plan management, multi-community behavior, Mini Program onboarding functionality, mandatory map SDK/geolocation/routing/navigation, desktop two-column layout, shared plans, and AI control over plan structure.

Release remains blocked until a server-side `DEEPSEEK_API_KEY` is configured, the DeepSeek account has usable balance, a preflight request to `https://api.deepseek.com/chat/completions` succeeds with model `deepseek-v4-flash`, and a real online plan response has `generation_source: "ai_enhanced"`, `ai_status: "ok"`, and `usage.total_tokens > 0`. The key SHALL never be exposed through a `VITE_` variable, browser bundle, log, fixture, or evidence artifact.
