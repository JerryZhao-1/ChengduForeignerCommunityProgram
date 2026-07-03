## Context

The project is entering the 2026-06-24 to 2026-06-30 all-module integration window. Core local/API readiness is largely in place, and the CloudBase dev API function and `/api` route are already documented, but the 6.22 and 6.23 gates remain incomplete in the sprint plan.

The open gates are cross-cutting:

- Mini Program `cloudbase-function` build and WeChat DevTools import evidence.
- Real-device places map/navigation/share verification or explicit blocker classification.
- Admin static hosting to CloudBase dev API domain verification.
- Lint blocker caused by generated CloudBase deployment output under `apps/api/.cloudbase/`.
- Dev data cleanup/classification and handoff documentation for 6.24 integration.

This change should not redefine API contracts. It should convert existing implementation and environment state into auditable release-readiness evidence and fix validation blockers that prevent the 6.23 gate from closing.

## Goals / Non-Goals

**Goals:**

- Make the Mini Program CloudBase function build reproducible with the documented dev env id and function name.
- Capture WeChat DevTools and physical-device evidence for places list/map/detail/navigation/share, or record exact blockers by severity.
- Verify Admin hosting reaches the intended CloudBase dev API domain and does not fail on route refresh.
- Resolve the current lint blocker without weakening source lint coverage.
- Freeze and document the 6.24 integration entry points, actors, environment values, data state, and known P0 blockers.
- Update `docs/plan.md` only after evidence exists for each checkbox.

**Non-Goals:**

- Completing production CloudBase env, production auth, or database/storage security rules.
- Completing non-places live provider persistence for events, discover, files, notifications, or auth.
- Completing real CloudBase gallery media acceptance unless the required storage file id is already available during implementation.
- Adding new API contracts or changing public response schemas.

## Decisions

1. Treat generated CloudBase deployment output as build artifact, not source.

   `apps/api/.cloudbase/community-map-api/index.cjs` is generated deployment output and contains bundled dependency code. ESLint should continue checking source files while ignoring generated deployment packages. The preferred implementation is an ESLint ignore entry for `**/.cloudbase/**`, paired with a documented package build smoke so generated output is still verified by runtime/build checks.

   Alternative considered: patch generated `index.cjs` to satisfy lint. That is brittle because the file is regenerated and includes third-party bundle code.

2. Split Mini Program validation into CLI build evidence and GUI/device evidence.

   The CLI portion should prove the package builds with `VITE_API_MODE=cloudbase-function`, `VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`, and `VITE_CLOUDBASE_FUNCTION_NAME=community-map-api`. WeChat DevTools import and real-device map/navigation/share checks require GUI/device evidence and should be captured through a runbook, screenshots, notes, or blocker records.

   Alternative considered: mark the task complete after CLI build only. That would miss the actual 6.22 exit standard.

3. Keep fallback-backed smoke separate from live persistence.

   Events, discover, auth, files, and notifications may respond through the CloudBase handler while still using fallback provider behavior. Handoff docs must state which endpoints are merely callable and which are backed by live CloudBase persistence.

   Alternative considered: treat HTTP 200 as live readiness. That would overstate the current system and hide remaining production risk.

4. Make the release handoff a concrete artifact.

   The 6.24 handoff should be a small document or section that lists API base URLs, hosted Admin URL, Mini Program app id, CloudBase env/function, actors/accounts, data state, validation command results, blocker list, and owner/next window for unresolved P0s.

   Alternative considered: leave the information spread across `README.md`, `docs/plan.md`, and deployment docs. That makes the integration start fragile.

## Risks / Trade-offs

- [Risk] WeChat DevTools or a physical device may not be available in the implementation session. -> Mitigation: build the package, provide exact import path and runbook, and record a P0 blocker with the missing device/tool prerequisite instead of marking the GUI/device task complete.
- [Risk] Admin hosting may contain an older deployed bundle. -> Mitigation: verify the hosted domain directly; if it cannot be updated in-session, record the deployed state, expected env vars, and required redeploy action.
- [Risk] Ignoring `.cloudbase` could hide a broken deployment package. -> Mitigation: pair the ignore with `pnpm --filter @community-map/api build:cloudbase-http` and CloudBase/API smoke validation.
- [Risk] Cleaning dev data could remove useful acceptance evidence. -> Mitigation: classify acceptance data before deletion and preserve ids/status in docs; do not mutate production data.
- [Risk] Handoff docs become stale quickly during the 7-day integration window. -> Mitigation: date the handoff and tie it to the exact validation command outputs and request ids available at the time.

## Migration Plan

1. Fix source validation first by excluding generated CloudBase deployment output from lint or otherwise scoping generated bundles out of source lint.
2. Run `pnpm typecheck`, `pnpm test`, and `pnpm lint`.
3. Build the Mini Program package in `cloudbase-function` mode and record the generated import path.
4. Verify or block WeChat DevTools import and real-device places flows.
5. Verify Admin hosting to CloudBase dev API behavior.
6. Clean or classify dev data and publish a 6.24 integration handoff.
7. Update `docs/plan.md` checkboxes only for evidence-backed completed work.

Rollback is documentation/config oriented: revert lint ignore if it proves too broad, restore previous docs if handoff evidence is invalid, and do not delete acceptance records without explicit data cleanup evidence.

## Open Questions

- Is WeChat DevTools installed and accessible in the execution environment?
- Is a physical device available for real-device places map/navigation/share verification?
- Should the Admin hosted bundle be redeployed as part of this change if the current hosting domain is stale?
- Which dev data records should be preserved as stable smoke fixtures versus cleaned before 6.24 integration?
