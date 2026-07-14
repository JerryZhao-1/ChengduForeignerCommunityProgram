## Context

The repository already provides public places/events APIs, a marker-safe places contract, Koa authentication middleware, mock and CloudBase providers, shared HTTP/mock clients, a uni-app H5/WeChat codebase, and a recursive zh/en mobile catalog. It does not provide a cross-module onboarding outcome, a Community Plan contract, an H5 route experience, or a safe anonymous actor.

The July 15 MVP is a guest-only competition path for the single Tongzilin community. It must remain useful offline, but release acceptance must separately prove a real server-side DeepSeek API call. The implementation order is fixed: DeepSeek account/API and CloudBase hosting preflight, shared schemas/contracts, API/provider, shared/mobile clients, then H5 UI.

Read-only infrastructure preflight on 2026-07-14 established:

- MCP authentication and environment binding are ready for `cloud1-d7gxdk8t43bd639c0`.
- the environment's shared Static Hosting is online at `cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com`;
- the CloudBase Web Apps list is empty, so `trae-h5-demo` can be created as a new independent service without replacing shared hosting.

The AI provider is the direct DeepSeek OpenAI-compatible API, not CloudBase managed AI. Official DeepSeek documentation currently lists `deepseek-v4-flash` and `deepseek-v4-pro`; the legacy `deepseek-chat` and `deepseek-reasoner` aliases are scheduled for deprecation on 2026-07-24. This design fixes `deepseek-v4-flash` with thinking disabled because the task is short, latency-sensitive JSON narration. Release still requires a valid server-side API key, usable account balance, and a real successful request. Source of truth: `https://api-docs.deepseek.com/`, `https://api-docs.deepseek.com/api/create-chat-completion/`, `https://api-docs.deepseek.com/quick_start/pricing/`, and the account usage page `https://platform.deepseek.com/usage`.

## Goals / Non-Goals

### Goals

- Complete a deterministic judge journey in at most 180 seconds with an explicit Start and a `1 visited place / 1 demo-confirmed event` completion result.
- Add a strict, public-safe Community Plan contract and one guest-only generation endpoint.
- Make deterministic selection the structural source of truth and the server-side DeepSeek API a narration-only enhancer.
- Deny guest writes everywhere except the exact plan-generation endpoint.
- Keep offline Demo behavior independent from the formal API and visibly distinguish it from online AI success.
- Make an ordered marker-safe route list mandatory and Tencent Map JavaScript SDK optional.
- Preserve H5 and mp-weixin builds while limiting functional acceptance to H5.
- Deploy to an independent CloudBase Web App and retain auditable online/offline release evidence.

### Non-Goals

- Authenticated plan generation, preference saving, analytics persistence, or plan detail retrieval.
- `activity` plan items, AI-generated structure, real event registration, tickets, capacity queries, or real-time full-event handling.
- Admin plan tooling, multi-community behavior, shared plans, or multi-user collaboration.
- Mini Program onboarding functionality, mandatory Tencent Map SDK, geolocation, route calculation, or navigation orchestration.
- A second desktop information architecture; desktop remains a centered single column.

## UI Design Specification

- **Purpose:** let a judge understand the value, generate a route, perform two unambiguous demo actions, and see completion without learning the existing module navigation.
- **Aesthetic direction:** reuse the approved editorial/organic community field-guide direction in `docs/competition/design/DESIGN.md`; this change does not create a second visual system.
- **Palette:** reuse `#F6F0E5` paper, `#0F766E` primary, `#123B3A` dark primary, `#E66A45` activity accent, and `#D39A3A` cultural-tip accent.
- **Typography/icons:** reuse Fraunces plus the existing Chinese typography stack and Lucide icons; no emoji icons or additional UI library.
- **Layout:** mobile-first at 390px; H5 and desktop use one route narrative with dashed editorial separators and a centered maximum width of 480px at 768px and above. MP deep links render only a localized H5-only placeholder.
- **Accessibility:** minimum 44px actions, keyboard-operable H5 controls, semantic labels/titles, visible focus, and at least 4.5:1 text contrast.

## Architecture and Data Flow

1. The H5 entry creates an in-memory judge session and sends `x-guest-mode: judge`; no bearer or mock actor header is sent.
2. The preferences page validates the strict shared input and calls only `POST /community-plan/generate`.
3. The API injects `community_id: "tongzilin"`, applies guest authorization and rate limiting, and asks the provider for public-safe candidates.
4. The deterministic engine produces exactly two ordered items: one published place and one configured curated event, totaling 120 minutes.
5. When AI is enabled, the API sends only enum preferences and public-safe plan projections from the server to DeepSeek Chat Completions; validated narration is merged without structural changes.
6. The shared HTTP client returns the plan to the mobile adapter. Transport errors/5xx may select the separate offline bundle; 4xx responses remain errors and are localized by code.
7. The session store owns local interaction statuses. No plan, preference, visit, or demo confirmation is persisted.
8. The route page renders the marker-safe list first and enhances it with the H5 SDK only when configuration and loading succeed.

## Decisions

### 1. Guest identity is API-internal and globally write-denied

The guest actor is a distinct API request-actor variant with `authenticatedVia: "guest"`; it is not a `User`, is not added to shared `ROLE_FLAGS`, and never inherits normal user permissions. The API may recognize `x-guest-mode: judge` and the exact `guest=judge` query marker, and CORS must allow the header.

A global guard allows guest `GET`, `HEAD`, and `OPTIONS` requests to existing public endpoints plus the exact `POST /community-plan/generate`. Every other guest mutation—including events, discover, files, places, auth preferences, notifications, and admin routes—returns the standard `403 FORBIDDEN` envelope. Client behavior is not considered an authorization control.

### 2. Preference and community input are closed

`NewResidentPreferenceSchema` is `.strict()` and contains only `preferred_language`, predefined `interests`, `arrival_context`, `household_type`, and predefined `accessibility_needs`. It has no free-text or identity fields and does not accept `community_id`; the API injects the literal `tongzilin` after validation. Unknown keys are rejected rather than stripped.

### 3. Community Plan structure is deterministic and invariant-checked

`CommunityPlanItemSchema` is a discriminated union:

- `place_visit` requires `ref_type: "place"`;
- `event_attend` requires `ref_type: "event"`.

`activity` is not valid. Every plan contains exactly one item of each type for this MVP. `item_id` and `ref_id` are independently unique. Items are sorted by `start_offset_minutes`, do not overlap, and each end is at most minute 120. `total_duration_minutes` equals the sum of all item durations and equals 120 for the canonical judge plan. The API supplies only initial `status: "pending"`; local session status is separately typed as `pending | visited | demo_confirmed | skipped | unavailable`.

The plan is ephemeral. Only `POST /community-plan/generate` is added; there is no detail GET, persistence layer, or server-side completion mutation.

### 4. Public-safe projections are explicit allowlists

The plan engine, AI adapter, route page, and offline fixture never receive generic entity/detail records.

- Place candidate/snapshot fields: `_id`, `name_zh`, `name_en`, `cover_url`, `category_level_1`, `is_recommended`, and `location` only.
- Event candidate/snapshot fields: `_id`, `title_zh`, `title_en`, `summary_zh`, `summary_en`, `start_time`, `end_time`, and `cover_url` only.
- Offline bundle fields: version, validated Community Plan, marker-safe markers, place snapshots, and event snapshots.

Serializers and tests must prove the absence of full addresses, intro/detail bodies, gallery/navigation/share data, organizer/contact data, capacity/registration internals, moderation/import-review fields, draft/deleted status, audit metadata, and all other admin-only fields.

### 5. The event is a fixed, explicitly non-booking demo action

`COMMUNITY_PLAN_DEMO_EVENT_ID` identifies the one curated public event used by the online engine; the offline bundle contains the corresponding safe snapshot. Release preparation verifies that the event is suitable and visible. Runtime does not query remaining capacity and does not promise availability.

The CTA says “Demo Confirm / 演示确认” and states that it creates no booking, reservation, ticket, or capacity hold. Confirmation is local and memory-only. No event registration endpoint is called. A missing curated fixture is a release configuration failure, not a reason to invent another event.

### 6. The server-side DeepSeek API can change narration only

Server configuration uses:

- `COMMUNITY_PLAN_AI_ENABLED=true` for the online release;
- `DEEPSEEK_API_KEY=<server-only secret>`;
- `DEEPSEEK_MODEL=deepseek-v4-flash`;
- `COMMUNITY_PLAN_AI_TIMEOUT_MS=8000` by default.

The adapter uses Node 20 `fetch` and `AbortController` to call `POST https://api.deepseek.com/chat/completions` directly. It sends `Authorization: Bearer ${DEEPSEEK_API_KEY}`, `model: "deepseek-v4-flash"`, `thinking: { "type": "disabled" }`, `stream: false`, `response_format: { "type": "json_object" }`, and `max_tokens: 1024`. The prompt explicitly requests JSON and includes the expected JSON shape, as required by DeepSeek JSON Output guidance. No API key or DeepSeek call is present in H5, Mini Program, shared fixtures, or `VITE_` variables.

The preflight checks the authenticated DeepSeek usage/balance page and performs a minimal sanitized non-streaming smoke request. HTTP 401 means invalid credentials and HTTP 402 means insufficient balance; either blocks release. The implementation does not depend on CloudBase Token Credits, `DescribeAIModels`, `UpdateAIModel`, or `@cloudbase/node-sdk` AI methods.

`CommunityPlanAIEnhancementSchema.strict()` accepts exactly one record for each plan `item_id`, containing only `item_id`, `summary_zh`, `summary_en` (maximum 240 characters each), `tips_zh`, and `tips_en` (maximum 160 characters each). The returned item-ID set must exactly equal the deterministic plan's set. The model cannot receive or return ref IDs, types, ordering, offsets, durations, statuses, or CTA definitions.

AI input excludes `accessibility_needs` and all free text. Logs exclude the API key, Authorization header, prompts, generated narration, complete preferences, and raw DeepSeek responses. A successful response copies only DeepSeek's non-negative `prompt_tokens`, `completion_tokens`, and `total_tokens` into the validated public `usage`; `usage.total_tokens > 0` is required for release evidence.

### 7. AI failure never breaks plan generation

Timeout, network error, HTTP 400/401/402/422/429/500/503, empty content, non-`stop` finish reason, invalid JSON, schema failure, missing/extra/duplicate item IDs, or length violation returns the original deterministic plan. HTTP 401/402 or missing key map to `unavailable`; HTTP 400/422/429/500/503 and network failures map to `upstream_error`; valid HTTP 200 with empty/invalid/truncated/refused output maps to `validation_failed`. The request path performs no automatic retry inside the 8-second judge budget. Timeout handling aborts fetch and uses a settled-result guard so a late response is ignored and cannot mutate the returned plan or logs.

Responses use `generation_source: "ai_enhanced"` and `ai_status: "ok"` only after validation. Normal disabled AI uses `rule_based/not_configured`; attempted-but-failed AI uses `rule_based_fallback` with `timeout`, `validation_failed`, `upstream_error`, or `unavailable`.

Runtime fallback is required for resilience, but the public release remains blocked until a real online AI success is evidenced.

### 8. Offline Demo is a separate adapter, not an API imitation

Mock mode loads the bundled fixture without network access. HTTP mode may use it only for transport failures, DNS failures, request timeout, or HTTP 5xx. HTTP 400/403/404/409/429 responses are mapped by stable error code to localized UI and never trigger offline mode. Offline/fallback mode is visibly labelled and never reports `ai_enhanced`.

The bundle is validated against the same strict plan and safe-projection schemas but is not exposed as a formal API provider capability. This prevents offline evidence from being mistaken for backend or AI readiness.

### 9. The judge path is an explicit state machine

Canonical transitions are:

`welcome --Start--> preferences --Generate--> plan --Open Route--> route-list --Back--> plan --Open Place--> place-detail --Mark Visited--> plan --Demo Confirm--> plan --Finish Route--> complete`.

`Finish Route` is disabled until every available place is `visited` and the curated event is `demo_confirmed`. A place detail 404 marks that place `unavailable` and removes it from both numerator and denominator; if it was the only place, the flow may finish after event confirmation while showing an explicit `0/0 unavailable-place` warning. The canonical release fixture must remain available so the judge path still proves `1/1` for both outcomes. `Start Over` clears all in-memory state. Refresh or deep link without a valid session redirects to welcome.

### 10. Route list is mandatory; H5 map SDK is optional

The route page always renders an ordered list from marker-safe data. When `VITE_H5_MAP_KEY` is present, its domain restrictions are ready, and the SDK loads, an H5-only adapter may add markers/route overlay. No key or SDK failure is a supported degraded state, not a release failure. Rendering uses explicit safe projections and never fetches place detail merely to build the route summary.

The WeChat `<map>` component is not reused for H5. H5 DOM code is compile-guarded. The Mini Program has no onboarding entry and shows a localized H5-only placeholder if deep-linked; only `build:mp-weixin` is required.

### 11. Rate limiting and logs have bounded trust

Only the guest generation endpoint is in MVP, at 10 requests per 60-second sliding window per resolved source. IP resolution uses `ctx.ip` and an explicit trusted-proxy configuration; raw `X-Forwarded-For` is ignored when the proxy is not trusted. Buckets expire after two minutes and the in-memory map is capped at 10,000 entries with deterministic oldest-expiry eviction. The response includes standard rate-limit headers and returns `429 RATE_LIMITED` when exhausted.

Generation logs contain only `requestId`, actor kind, fixed community ID, generation source, AI status, duration, timestamp, provider `deepseek`, model `deepseek-v4-flash`, upstream HTTP status category, and token total when successful. They never contain the API key/Authorization header, preferences, accessibility values, prompts, output text, contact data, or entity detail records.

### 12. Deployment is isolated from existing Admin hosting

The H5 is deployed with CloudBase Web Apps as service `trae-h5-demo`, producing the independent domain pattern `trae-h5-demo-cloud1-d7gxdk8t43bd639c0.webapps.tcloudbase.com`. The platform-returned URL is the source of truth and must be recorded. The existing shared Static Hosting URL and its files are captured before and verified unchanged after deployment.

## Failure Matrix

| Condition | Required behavior |
| --- | --- |
| AI timeout or late response | Return deterministic plan with `timeout`; ignore late result |
| AI invalid JSON/schema/ID set | Return deterministic plan with `validation_failed` |
| DeepSeek 400/422/429/500/503 or network error | Return deterministic plan with `upstream_error` |
| Missing/invalid API key or DeepSeek 401/402 | Return deterministic plan with `unavailable`; block release |
| DeepSeek 200 with empty content, non-stop finish, or invalid JSON/schema | Return deterministic plan with `validation_failed` |
| Place detail 404 | Mark local place item unavailable; remove it from completion denominator |
| Curated event missing at release check | Fail release configuration; do not substitute or claim registration |
| H5 map key/SDK unavailable | Keep ordered marker-safe route list fully usable |
| HTTP 4xx | Show localized mapped error; do not enter offline mode |
| Transport failure or HTTP 5xx | Load strict offline bundle and show offline badge |
| MP deep link | Show localized H5-only placeholder; no onboarding function claim |

## Validation Strategy

- Shared tests cover strict unknown-key rejection, discriminated unions, unique IDs, ordering/non-overlap, 120-minute invariants, safe projections, and absence of forbidden fields.
- API tests cover global guest write denial across modules, trusted-proxy/IP spoofing, limiter cleanup/cap, deterministic plan selection, AI success/failure/late response, no sensitive AI/log fields, and standard envelopes.
- Client tests cover shared-to-HTTP/mock/mobile ordering, 4xx localization, transport/5xx offline selection, and place-unavailable session behavior.
- H5 MCP evidence covers the exact state machine in both locales at 390px and desktop width, route-list baseline, optional-map degradation, refresh/deep-link recovery, and deterministic completion within 180 seconds.
- Release evidence separately proves a live AI round trip with positive token usage and an offline run with an offline badge; neither substitutes for the other.
- H5 and mp-weixin builds, root typecheck/test/lint, strict OpenSpec validation, task-ref validation, independent deployment, and unchanged Admin hosting are hard gates.

## Risks / Rollback

- DeepSeek availability depends on a valid secret and funded account. A 401/402 or absent positive-token smoke result blocks release; the key is rotated immediately if it appears in client assets, logs, or evidence.
- The request transfers enum preferences and public-safe place/event narration inputs to DeepSeek as a third-party processor. PII, free text, accessibility needs, detail fields, and admin fields remain excluded and the transfer boundary must be documented.
- In-memory rate limiting is not multi-instance consistent; this is accepted only for the competition MVP and must be documented.
- Optional map enhancement may not be ready by the deadline; the route list is the complete baseline experience.
- The onboarding entry, Community Plan route, and independent Web App can be withdrawn without changing existing places/events/discover contracts or existing Admin hosting.

## Resolved Scope Decisions

There are no open product questions for implementation. The provider is direct DeepSeek Chat Completions, the release model is `deepseek-v4-flash`, and thinking is disabled. The remaining external gates are a valid server-only key, usable DeepSeek balance/live smoke, the fixed event ID, and the returned CloudBase Web App URL.
