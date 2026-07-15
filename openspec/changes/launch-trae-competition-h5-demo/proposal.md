## Why

The current product exposes places, events, and community content as separate modules, but a first-time resident or competition judge still has to decide what to do next. The July 15 competition release adds a guest-only product loop: choose a small, finite profile, receive an explainable "First 120 Minutes" community plan, visit one place, demo-confirm one community activity, and reach an explicit completion result within three minutes.

This is a substantive iteration rather than a repackaging of existing pages. It introduces a cross-layer Community Plan contract, a versioned bilingual editorial catalog, deterministic coverage for 576 resident profiles, a protected guest actor, an online/offline shared matcher, a route experience, and auditable TRAE development and release evidence. The competition product itself performs no AI or LLM calls.

## What Changes

- Add a public H5 judge entry with no login, bearer token, or mock-user semantics.
- Replace multi-select preferences with required singular `primary_interest` and `accessibility_need` fields alongside language, arrival context, and household type.
- Cover exactly `8 × 3 × 4 × 6 = 576` logical profiles and `1,152` localized render cases by composing 21 prewritten bilingual dimension modules from one versioned catalog; the release does not maintain 576 duplicated full-text plans.
- Add `scenario_key`, `catalog_version`, and a four-reason `selection_explanation` to the strict Community Plan response.
- Keep only `POST /community-plan/generate`; the request does not accept `community_id`, identity data, or free text, and plans are not persisted.
- Produce a deterministic two-item, 120-minute plan containing one curated place visit and one fixed demo event.
- Use the same shared matcher and catalog bundle for the API, mock mode, and H5 transport/5xx fallback.
- Keep Demo Confirm explicitly local and non-booking; no registration, ticket, capacity, or availability claim is made.
- Keep the marker-safe route list mandatory and the H5 Tencent Map SDK optional.
- Keep the WeChat Mini Program build green without exposing the competition entry.
- Deploy the H5 as an independent Vercel project `trae-h5-demo`; CloudBase retains the production API and existing Admin Static Hosting.
- Produce separate online and offline acceptance evidence plus append-only TRAE session evidence.

## Capabilities

### New Capabilities

- `community-plan-generation`: strict singular preferences, versioned editorial catalog, exhaustive deterministic matching, explainable output, and public-safe projections.
- `trae-competition-h5-experience`: guest entry, single-choice preferences, explainable plan, route list/optional map, local participation actions, completion, and offline mode.
- `competition-release-evidence`: exhaustive catalog coverage, guest security, privacy, online/offline parity, independent deployment, and append-only evidence.

### Modified Capabilities

- `mobile-language-experience`: complete zh/en single-choice, explanation, delivery-state, and error copy without raw enum or model-status output.

## Impact

- `packages/shared`: breaking Community Plan request/response migration, curated catalog, scenario enumerator, shared matcher, safe bundle, clients, and tests.
- `apps/api`: guest generation route/provider uses the shared catalog and matcher; competition-specific model integration is removed.
- `apps/mobile`: singular onboarding state, explainable plan UI, and online/offline shared matching.
- `apps/admin`: no source changes; its existing Static Hosting must remain reachable and unchanged.
- `docs/`: product title, competition runbook, API documentation, evidence log, and judge script.
- `auto_test_openspec/`: new immutable validation runs for active references R10–R18 only.

## July 15 Scope Boundary

Deferred beyond this MVP: authenticated plans, saved preferences, plan persistence/detail GET, real event registration/tickets/capacity, Admin plan management, multi-community behavior, Mini Program onboarding functionality, mandatory map/geolocation/routing, shared plans, and verified venue accessibility facilities.

Release is gated by `576/576` logical profiles, `1,152/1,152` localized render cases, `576/576` API/local semantic parity, successful H5 and mp-weixin builds, an externally accessible H5, and an online and offline judge flow that each complete within 180 seconds. The runtime, public contract, frontend bundle, logs, and current release documentation contain no model call, model credential, or AI result field.

Implementation completion, worker validation-bundle preparation, and Supervisor verification are separate evidence states. A checked implementation task or a prepared run folder is not release-PASS evidence unless the immutable run contains its real outputs/logs and the Supervisor verdict with evidence pointers.
