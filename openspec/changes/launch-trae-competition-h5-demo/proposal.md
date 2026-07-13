## Why

The ChengduForeignerCommunityProgram currently serves the Tongzilin community with places, events, and discover modules, but new residents—especially foreigners—lack a guided onboarding experience that helps them navigate their first two hours in the community. The TRAE AI Creativity Competition requires a publicly accessible mobile H5 demo that showcases an AI-assisted "First 120 Minutes" community integration route. This change creates that experience as a standalone H5 entry point that reuses the existing uni-app codebase, shared contracts, and API layer, while adding guest/judge access, a preference questionnaire, a structured Community Plan, a rule-based recommendation engine with optional AI enhancement, and a map-based route visualization.

## What Changes

- Add a guest/judge mode that allows competition reviewers to access the H5 demo without WeChat login, using a read-only actor with deterministic demo data.
- Add a structured new-resident preference questionnaire schema in `packages/shared` covering language, interests, arrival context, household type, and accessibility needs.
- Add a structured Community Plan schema in `packages/shared` that represents a 120-minute timeline of plan items, each referencing a published place or an open event by ID.
- Add a rule-based recommendation engine in `apps/api` that generates a Community Plan from preferences by selecting and sequencing published places and open events.
- Add an optional CloudBase AI enhancement layer that can enrich the rule-based plan with personalized narration; the AI call has a configurable timeout and validation gate.
- Add a deterministic fallback that produces a fixed curated plan when the AI call times out, returns invalid output, or is not configured.
- Add an H5 route map page that renders place markers and a route overlay using the existing Tencent Map integration and places map-markers contract.
- Add plan-item linkage to places detail, events registration, and navigation so the user can act on each step of the route.
- Add a plan completion page that summarizes visited places, registered events, and the overall route result.
- Extend the central bilingual catalog in `apps/mobile/src/i18n` with all onboarding UI text, maintaining zh/en recursive key parity.
- Add offline demo data and graceful degradation so the H5 demo works without a live API, falling back to bundled JSON fixtures.
- Add 390px mobile-first and desktop responsive layout for all onboarding pages.
- Add rate limiting, request logging, and privacy boundaries for the plan generation endpoint.
- Add competition evidence and release acceptance validation bundles.

## Capabilities

### New Capabilities

- `trae-competition-h5-experience`: The end-to-end H5 onboarding experience covering guest/judge mode, preference questionnaire, plan timeline, route map, completion result, offline demo, responsive layout, and bilingual UI.
- `community-plan-generation`: The Community Plan data model, rule-based recommendation engine, optional AI enhancement, deterministic fallback, and public-reference validation.
- `competition-release-evidence`: Competition evidence collection, observability, rate limiting, privacy boundaries, and H5 release acceptance.

### Modified Capabilities

- `mobile-language-experience`: Extend the central bilingual catalog with onboarding and community-plan UI text entries, maintaining zh/en recursive key parity and fallback indicator semantics.

## Impact

- `packages/shared`: New schemas (`community-plan.ts`), new contracts (`community-plan.ts`), new paths in `paths.ts`, new mock data and fixtures, new types.
- `apps/api`: New routes (`community-plan.ts`), new provider methods, rule-based engine, AI enhancement layer, fallback logic, rate limiting middleware, guest actor handling.
- `apps/mobile`: New onboarding pages (welcome, preferences, plan, route-map, complete), new i18n catalog entries, offline demo data loader, responsive layout components, page registration in `pages.json`.
- `apps/admin`: No direct changes required; existing place/event management remains the source of truth for plan references.
- `docs/`: Competition H5 documentation, evidence runbook, and release handoff.
- `auto_test_openspec/`: New validation bundles under `auto_test_openspec/launch-trae-competition-h5-demo/` (append-only; no modification of existing run folders).
- External systems: CloudBase AI service (optional), Tencent Map (H5 map rendering), public H5 hosting target.
