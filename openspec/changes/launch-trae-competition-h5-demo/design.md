## Context

The project has a working monorepo with `apps/mobile` (uni-app H5 + WeChat Mini Program), `apps/admin` (Vue + Element Plus), `apps/api` (Koa BFF / CloudBase HTTP function), and `packages/shared` (Zod schemas, contracts, paths, mock client). The existing modules—places, events, discover—have public contracts, mock data, and CloudBase live provider support. The mobile app has a tab-based navigation (Home, Events, Discover, Places, Me) with bilingual catalog support via `apps/mobile/src/i18n/catalog.ts`.

The TRAE AI Creativity Competition requires a publicly accessible H5 demo that guides new residents—especially foreigners—through their first 120 minutes in the Tongzilin community. The demo must work for judges without login, generate a personalized route from a preference questionnaire, optionally enhance it with AI, display the route on a map, link to real places and events, and work offline with graceful degradation. The same uni-app code must later publish as a WeChat Mini Program.

Key existing pieces the design builds on:

- `packages/shared/src/contracts/paths.ts` — central API path registry.
- `packages/shared/src/contracts/define-contract.ts` — `defineContract` pattern for method/path/request/response.
- `packages/shared/src/schemas/entities.ts` — `PlaceSchema`, `EventSchema` with bilingual `_zh`/`_en` fields.
- `packages/shared/src/schemas/places.ts` — `PlaceMapMarkerSchema`, `PlaceListItemSchema`, `PlaceDetailSchema`.
- `packages/shared/src/schemas/events.ts` — `CreateEventRegistrationInputSchema`, `EventListQuerySchema`.
- `packages/shared/src/schemas/auth.ts` — `AuthPreferencesSchema` with `preferred_language`.
- `packages/shared/src/mock/data.ts` — `createMockDataset` with places, events, users.
- `packages/shared/src/client.ts` — `createHttpClient` with Bearer token and mock actor header support.
- `apps/mobile/src/config/env.ts` — `mobileEnv` with `apiMode`, `apiBaseUrl`, `cloudbaseEnvId`.
- `apps/mobile/src/i18n/catalog.ts` — central bilingual catalog with `WidenCatalog` type parity enforcement.
- `apps/mobile/src/pages.json` — page registry and tabBar configuration.
- `apps/api/src/routes/` — existing route modules for places, events, auth, discover.

## Goals / Non-Goals

**Goals:**

- Produce a publicly accessible H5 demo that competition judges can access without login.
- Generate a structured 120-minute Community Plan from a preference questionnaire using a rule-based engine.
- Optionally enhance the plan with CloudBase AI, with a deterministic fallback on timeout or validation failure.
- Render the plan as a timeline and a map route overlay using existing place and event data.
- Link plan items to real place detail, event registration, and navigation flows.
- Work offline with bundled demo data and degrade gracefully on weak networks.
- Support 390px mobile and desktop responsive layouts.
- Maintain full bilingual (zh/en) catalog coverage for all onboarding UI text.
- Add rate limiting, observability, and privacy boundaries for the generation endpoint.
- Produce competition evidence and release acceptance validation bundles.

**Non-Goals:**

- This change does not implement private chat, a full friend system, payments, multi-community platformization, leaderboards, or real-time multi-player matching.
- This change does not refactor the existing admin backend or modify existing public API contracts for places, events, or discover.
- This change does not submit the H5 to any app store or WeChat review; it produces a publicly hosted H5 URL for competition judges.
- This change does not implement the WeChat Mini Program build for the onboarding flow; the same code is designed to be reusable, but Mini Program publishing is a later phase.

## Decisions

1. Guest/judge mode uses a dedicated read-only actor, not the existing mock actor.

   The existing `x-mock-user-id` header is a development convenience tied to `user_001`. Competition judges need access without any authentication. The H5 demo will use a `guest` API mode where the client sends no auth token and no mock actor header; the API recognizes a `x-guest-mode: judge` header (or query param for H5 compatibility) and resolves a read-only guest actor with no write capabilities. Event registration in guest mode creates a guest-scoped registration that is clearly labeled as demo data.

   Alternative considered: reuse `x-mock-user-id` with a `judge_001` user. Rejected because mock actor is documented as development-only and would混淆 production auth semantics.

2. Community Plan is a structured timeline schema, not a free-form AI text response.

   The `CommunityPlanSchema` contains an ordered array of `CommunityPlanItemSchema`, each with a `type` (`place_visit` | `event_attend` | `activity`), a `ref_id` pointing to a real place or event, a `start_offset_minutes` and `duration_minutes` within the 120-minute window, bilingual title/summary, and a `status` field. The AI enhancement layer enriches the `summary_zh`/`summary_en` and `tips_zh`/`tips_en` fields but cannot invent new place or event IDs; it can only reorder, annotate, or adjust durations of items produced by the rule-based engine.

   Alternative considered: let the AI generate the full plan as free text. Rejected because unstructured AI output cannot be validated against real place/event IDs and would break the map and linkage features.

3. Rule-based engine is the primary path; AI is an optional enrichment layer.

   The rule-based engine selects places and events from the existing published dataset based on preference weights (interests, accessibility, household type, arrival context). It always produces a valid plan. The AI layer, when configured and within timeout, receives the rule-based plan and the preferences, and returns enriched narration. If the AI response fails Zod validation or times out, the rule-based plan is returned unchanged with a `generation_source: "rule_based_fallback"` flag.

   Alternative considered: make AI the primary path with rule-based as fallback only. Rejected because competition demos must be reliable; a deterministic plan must always be available.

4. AI timeout and validation gate are configurable and observable.

   The AI call has a configurable timeout (env `COMMUNITY_PLAN_AI_TIMEOUT_MS`, default 8000ms). The response is validated against `CommunityPlanAIEnhancementSchema` before merging. On timeout, validation failure, or AI not configured, the system logs the event with `requestId` and returns the rule-based plan. The response includes `generation_source` (`"ai_enhanced"` | `"rule_based"` | `"rule_based_fallback"`) and `ai_status` (`"ok"` | `"timeout"` | `"validation_failed"` | `"not_configured"`).

   Alternative considered: hide AI failures from the user. Rejected because observability and transparency are competition judging criteria.

5. Offline demo data is a bundled JSON fixture loaded by the mobile client.

   The mobile app includes a `demo-plan.json` fixture in `apps/mobile/src/static/` containing a curated 120-minute plan with real place/event IDs from the mock dataset. When `apiMode` is `mock` or when the API is unreachable, the client loads this fixture and renders the full experience without network calls. The fixture is generated from the same schema as the API response, ensuring type safety.

   Alternative considered: require a live API for all functionality. Rejected because competition judges may access the H5 in environments with unreliable networks, and the demo must always work.

6. H5 route map reuses the existing `PlaceMapMarkerSchema` and Tencent Map integration.

   The route map page calls `GET /places/map-markers` for the community's published places, then overlays the plan items as an ordered route polyline. Each marker is clickable and links to the place detail page. The route polyline connects plan items in chronological order. The map uses the same Tencent Map SDK already integrated in the mobile app.

   Alternative considered: build a separate map dataset for the route. Rejected because it would duplicate data and break consistency with the places module.

7. Responsive layout uses CSS breakpoints at 390px and 768px.

   All onboarding pages are mobile-first at 390px width. At 768px and above, the layout switches to a centered single-column with max-width 480px for readability, or a two-column layout for the plan timeline and map side-by-side. The existing TDesign MiniProgram components are used where applicable; custom layout uses CSS variables consistent with the TDesign visual language.

   Alternative considered: build separate desktop and mobile pages. Rejected because uni-app H5 builds should share page components across breakpoints.

8. Rate limiting is per-IP with a guest-tier lower limit.

   The plan generation endpoint applies per-IP rate limiting: 10 requests/minute for guest mode, 30 requests/minute for authenticated users. Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are included in responses. When the limit is exceeded, the API returns `429` with `RATE_LIMITED` error code.

   Alternative considered: no rate limiting for the competition demo. Rejected because the H5 is publicly accessible and unprotected endpoints can be abused.

9. Privacy: guest preferences are not persisted; no PII is collected.

   Guest-mode preference submissions are processed in-memory to generate the plan and are not written to the database. The preference schema explicitly excludes name, phone, email, and any free-text fields that could contain PII. Authenticated users may optionally save preferences via the existing `/auth/preferences` endpoint, but this is not required for the demo.

   Alternative considered: persist guest preferences for analytics. Rejected because privacy boundaries are a competition criterion and the demo should not collect judge data.

## Risks / Trade-offs

- [Risk] CloudBase AI service may be unavailable or slow during competition judging. -> Mitigation: deterministic rule-based fallback with 8s timeout; the demo always produces a valid plan.
- [Risk] Public H5 hosting may introduce CORS or domain issues. -> Mitigation: API layer already has CORS support; H5 build uses relative API paths or configurable base URL.
- [Risk] Tencent Map SDK may fail to load on some networks. -> Mitigation: the route map page shows a fallback list view when the map fails to initialize.
- [Risk] Guest mode could be abused to spam event registrations. -> Mitigation: guest registrations are labeled as demo data, rate-limited, and not counted toward real event capacity.
- [Risk] Bilingual catalog parity errors could leak untranslated text. -> Mitigation: the existing `WidenCatalog` type-level parity check in `catalog.ts` will catch missing keys at compile time.
- [Risk] Offline fixture data may become stale if mock dataset changes. -> Mitigation: the fixture is generated from the same mock dataset and schema; a test verifies fixture validity.
- [Risk] Desktop layout may look odd on very wide screens. -> Mitigation: max-width constraint and centered layout prevent over-stretching.

## Migration Plan

1. Define Community Plan schemas, contracts, and paths in `packages/shared`.
2. Add mock data and demo plan fixtures in `packages/shared` and `apps/mobile`.
3. Implement API routes, rule-based engine, AI layer, and fallback in `apps/api`.
4. Implement guest/judge mode auth handling in `apps/api`.
5. Add rate limiting, observability, and privacy middleware.
6. Create mobile onboarding pages (welcome, preferences, plan, route-map, complete).
7. Extend bilingual catalog with all onboarding UI text.
8. Implement offline demo data loader and graceful degradation.
9. Implement responsive layout for 390px and desktop.
10. Run full validation gate (typecheck, test, lint, openspec validate).
11. Produce competition evidence and release handoff.

Rollback: the onboarding experience is additive; removing the new pages, routes, and schemas restores the prior state. The H5 demo URL can be withdrawn without affecting the existing Mini Program or admin functionality.

## Open Questions

- What is the public H5 hosting target URL for competition judges?
- Is the CloudBase AI service already configured, or does it need a new environment variable?
- Should guest-mode event registrations be visible in the admin console, or completely isolated?
- What is the preferred AI model for the enhancement layer (Hunyuan, DeepSeek, or other CloudBase AI)?
- Should the demo plan fixture include a fixed set of place/event IDs, or should it dynamically reference the current mock dataset?
