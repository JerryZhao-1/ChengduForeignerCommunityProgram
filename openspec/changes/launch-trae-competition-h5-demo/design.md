## Context

The repository already provides public places/events APIs, marker-safe place contracts, Koa authentication middleware, mock and CloudBase providers, shared HTTP/mock clients, and a uni-app H5/WeChat codebase. Earlier competition work produced a guest Community Plan loop with optional model-enhancement fields and a fixed offline plan; those artifacts are the superseded migration baseline, not the current runtime state.

The revised July 15 MVP is a guest-only, AI-free competition path for the single Tongzilin community. It must predefine a meaningful response for every supported preference combination and remain useful when the API is unavailable. The implementation order is: specifications, strict shared contracts, curated catalog/matcher, API/provider cleanup, mobile/offline migration, then exhaustive validation and deployment.

Read-only infrastructure preflight established that CloudBase environment `cloud1-d7gxdk8t43bd639c0` is available, existing shared Static Hosting is online, and `trae-h5-demo` can remain an independent Web App target. Deployment still requires a separate deployment-gate confirmation.

## Goals / Non-Goals

### Goals

- Complete the judge journey in at most 180 seconds with one visited place and one demo-confirmed event.
- Cover exactly 576 logical resident profiles and 1,152 zh/en render cases.
- Make every selected dimension visible through one of four fixed-order explanation reasons.
- Use one versioned editorial catalog and matcher in shared code for online, mock, and offline behavior.
- Deny guest writes everywhere except exact plan generation.
- Keep the route list mandatory, map rendering optional, and H5/mp-weixin builds green.
- Preserve append-only TRAE and validation evidence.

### Non-Goals

- AI/LLM runtime use, generated copy, model credentials, model provenance, or model-status UI.
- Authenticated plans, persistence, analytics, plan detail retrieval, or preference saving.
- Real event registration, tickets, capacity, or availability checks.
- Verified accessibility certification for venues.
- Admin plan tooling, multi-community behavior, or Mini Program functional acceptance.

## UI Design Specification

- **Purpose:** let a new resident choose four meaningful dimensions quickly, understand why the route was matched, and complete two explicit local demo actions without learning the existing module navigation.
- **Aesthetic direction:** organic/natural community field guide, reusing the approved competition design system rather than creating a second visual language.
- **Palette:** `#F6F0E5` paper, `#0F766E` primary, `#123B3A` dark primary, `#E66A45` activity accent, and `#D39A3A` editorial-tip accent.
- **Typography/icons:** reuse Fraunces, the existing Chinese typography stack, and Lucide icons. Existing project typography is an explicit design-system override; no new UI library or emoji icon is introduced.
- **Layout:** mobile-first at 390px, one narrative column, dashed editorial separators, and a centered maximum width of 480px on desktop.
- **Accessibility:** required singular choices, 44px minimum targets, keyboard-operable H5 controls, semantic labels, visible focus, and at least 4.5:1 text contrast.

## Architecture and Data Flow

1. The H5 entry creates an in-memory judge session and sends `x-guest-mode: judge` without bearer or mock-actor headers.
2. The preferences page submits only `preferred_language`, `primary_interest`, `arrival_context`, `household_type`, and `accessibility_need`.
3. The API validates the strict request, applies guest authorization and rate limiting, and calls the shared matcher with the versioned Tongzilin catalog bundle.
4. The matcher creates a language-independent scenario key, selects a curated place deterministically, appends the fixed demo event, and composes four bilingual explanation reasons.
5. The shared HTTP client returns the strict plan. Mock mode and transport/DNS/timeout/5xx fallback invoke the same matcher and bundle locally.
6. The mobile store records delivery mode separately from the plan and owns local visit/demo-confirm statuses. Nothing is persisted.
7. The route page renders its marker-safe list first and optionally enhances it with the H5 map SDK.

## Decisions

### 1. Guest identity remains API-internal and globally write-denied

The guest actor remains `authenticatedVia: "guest"`, is not a shared user role, and can call public reads plus only `POST /community-plan/generate`. All other guest mutations return the standard `403 FORBIDDEN` envelope. CORS allows `x-guest-mode`.

### 2. Preference input is finite and singular

`NewResidentPreferenceSchema.strict()` contains exactly:

- `preferred_language`: `zh | en`;
- `primary_interest`: one of eight existing interest enums;
- `arrival_context`: one of three enums;
- `household_type`: one of four enums;
- `accessibility_need`: `none` or one of five existing needs.

All fields are required. The request contains no `community_id`, arrays, identity/contact data, or free text. The 576 logical profiles are `8 × 3 × 4 × 6`; language selects rendering and does not enter the scenario key.

### 3. Scenario keys and explanations are strict

The canonical key is:

`v1:{primary_interest}:{arrival_context}:{household_type}:{accessibility_need}`

Every plan has literal catalog version `tongzilin-curated-v1` and one selection explanation containing bilingual summary plus exactly four reasons in this order:

1. `primary_interest`;
2. `arrival_context`;
3. `household_type`;
4. `accessibility_need`.

Dimensions are unique. The same logical preference has the same key and semantic plan in zh and en.

### 4. The catalog is modular, editorial, and exhaustive

The shared catalog contains exactly 21 paired zh/en dimension modules: 8 interests, 3 arrival contexts, 4 household types, and 6 accessibility needs. The matcher composes these modules for 576 logical profiles rather than maintaining 576 duplicated full-text plans. It also contains interest-to-place-category priorities, category narration, the fixed event narration, safe place/event snapshots, and a catalog version.

The matcher may select the same route for multiple profiles, but each profile has its own scenario key and four choice-specific reasons. Stable sorting uses score descending and `_id` ascending as the tie-breaker. Runtime time, random values, object insertion order, and display language never influence semantic selection.

The four-reason tuple is the user-facing correspondence between one preference combination and its feedback. Different profiles may share a place or event, but every reason must be sourced from the module selected by the matching preference dimension.

### 5. Accessibility content is advice, not facility certification

The public-safe place projection has no verified facility metadata. `accessibility_need` therefore changes only the explanation and practical confirmation tip. Copy may recommend contacting the venue, using written communication, allowing rest time, or visiting off-peak. It must not state that a venue has step-free entry, accessible toilets, hearing equipment, verified quietness, or any other unverified facility.

### 6. The two-item route remains invariant-checked

Each plan contains exactly one `place_visit` and one `event_attend`, each initially `pending`, ordered at offsets 0 and 60 and totaling 120 minutes. Item/ref uniqueness, type/ref consistency, chronology, non-overlap, event-window coverage, and public projection allowlists remain enforced. The plan is ephemeral and has no detail or completion-write endpoint.

### 7. Online and offline paths share behavior

The competition bundle contains its versioned feedback modules, public-safe curated places, the fixed public-safe event, and curated event ID. The API, mock client, and H5 fallback call the same shared matcher. Semantic parity compares scenario key, catalog version, item refs, explanation, summaries, and tips; request ID and generated timestamp may differ.

Delivery mode is mobile state only: `online | offline`. It is not part of `CommunityPlanSchema`. HTTP 400/403/404/409/429 remain localized errors. Mock mode and transport/DNS/timeout/5xx use local matching and show “离线演示 · 使用同版本本地社区目录”.

### 8. The competition runtime has no model integration

The competition-specific model adapter, environment variables, response fields, status copy, provider calls, and tests are removed. The plan response has no `generation_source`, `ai_status`, `usage`, or `generated_by`. Current product copy makes no AI-generation claim. Generic CloudBase SDK compatibility stubs outside this feature may remain only when still required by existing deployment bundling and are not a Community Plan runtime capability.

### 9. Demo participation remains explicitly local

The fixed event action says Demo Confirm and creates no booking, reservation, ticket, or capacity hold. The client calls no event registration, availability, or capacity endpoint. A missing curated place/event bundle is a release configuration error; the matcher does not invent a replacement.

### 10. Rate limiting and logging remain bounded

The guest endpoint remains limited to 10 requests per 60 seconds per trusted resolved source, with two-minute expiry and a 10,000-bucket cap. Generation logs contain only request ID, actor kind, fixed community ID, scenario key, catalog version, duration, and timestamp. They exclude full preferences, accessibility choice, explanation text, entity detail fields, and personal data.

### 11. H5 and Mini Program boundaries remain explicit

The five onboarding pages stay outside tabBar. H5 owns functional acceptance. H5-only DOM/map code is compile-guarded. The Mini Program exposes no competition entry and shows its localized H5-only placeholder if deep-linked. Both production builds are required.

### 12. Deployment remains isolated

The H5 target remains CloudBase Web App service `trae-h5-demo`. Existing shared Static Hosting/Admin content is captured before and verified unchanged after deployment. The platform-returned URL is the source of truth.

## Failure Matrix

| Condition                            | Required behavior                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Invalid or legacy preference fields  | Return `400 VALIDATION_ERROR`; do not strip fields                             |
| Missing curated place/event data     | Fail configuration; do not invent a successful route                           |
| Place detail 404                     | Mark the local place unavailable and remove it from the completion denominator |
| H5 map SDK unavailable               | Keep the ordered marker-safe route list usable                                 |
| HTTP 400/403/404/409/429             | Show localized error; do not use offline mode                                  |
| Mock mode, transport/DNS/timeout/5xx | Run the shared matcher locally and show the offline badge                      |
| Refresh/deep link without session    | Redirect safely to welcome                                                     |
| Mini Program deep link               | Show localized H5-only placeholder                                             |

## Validation Strategy

- Shared tests enumerate exactly 576 logical profiles, 576 unique keys, and 1,152 localized render cases with no invalid plans or missing copy.
- Contract tests reject legacy arrays, unknown/PII/community fields, old response fields, malformed explanations, unsafe projections, and invalid route invariants.
- API tests cover guest write denial, limiter behavior, strict request parsing, 576 provider generations, privacy-safe logs, and the absence of model calls.
- Client tests prove 576/576 semantic parity between API/provider and local matching plus correct 4xx/5xx fallback boundaries.
- Browser evidence covers four representative profiles, both locales, 390px/desktop, route-list degradation, reset/refresh, and completion in 180 seconds.
- Root typecheck/test/lint, H5/mp-weixin builds, strict OpenSpec validation, independent deployment, and unchanged Admin hosting are hard gates.

## Risks / Rollback

- A versioned curated snapshot can become stale; release preparation must verify its source place/event remains suitable and update the version when editorial content changes.
- In-memory rate limiting is not multi-instance consistent; this remains a documented competition-MVP limitation.
- Optional map enhancement may not be ready; the route list is the complete baseline experience.
- Rollback removes the competition entry/route and independent Web App without changing existing places/events/discover contracts or Admin hosting.

## Resolved Scope Decisions

There are no open product decisions. Preferences are required single choices, the logical domain is 576 profiles, the catalog is `tongzilin-curated-v1`, API and offline use the same shared matcher, accessibility output is advisory only, and the competition runtime uses no AI or LLM.
