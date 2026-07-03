## Why

The 6.22 and 6.23 release-readiness gates are still open: Mini Program CloudBase function build/device verification, Admin hosting to API wiring, lint cleanup, data cleanup, and integration handoff materials are not yet captured as completed evidence. This change turns those dated sprint tasks into explicit acceptance work so the 6.24 all-module integration window can start from a known, auditable baseline.

## What Changes

- Verify the Mini Program can be built in `cloudbase-function` mode with the documented CloudBase dev environment and `community-map-api` function.
- Produce WeChat DevTools import and main-flow verification evidence for the generated Mini Program package.
- Record real-device places map/navigation/share evidence, or document exact blockers with severity and next action.
- Verify the Admin hosted dev domain can reach the intended CloudBase dev API domain and does not fail on route refresh.
- Resolve or explicitly scope the current lint blocker caused by generated CloudBase deployment output under `apps/api/.cloudbase/`.
- Freeze and document the 6.24 integration inputs: API domains, app ids, mock actors/accounts, data state, known blockers, and ownership for same-day P0 fixes.
- Clean or classify dev test data so imported drafts, acceptance records, and incomplete media references are not mistaken for production data.

## Capabilities

### New Capabilities

- `mini-program-release-readiness`: Covers cloudbase-function build, WeChat DevTools import, main-flow smoke, real-device places map/navigation/share evidence, and blocker classification.
- `admin-hosting-api-readiness`: Covers Admin static hosting to CloudBase dev API domain integration, route refresh behavior, and environment wiring evidence.
- `release-readiness-gate`: Covers 6.23 interface/config freeze, test-data cleanup, full validation command status, lint blocker resolution, and 6.24 handoff materials.

### Modified Capabilities

- `cloudbase-dev-api-deployment`: Clarifies that dev API smoke evidence must be consumed by the release handoff, while production env and security rules remain outside this specific 6.22/6.23 gate.

## Impact

- Affected apps: `apps/mobile`, `apps/admin`, and `apps/api`.
- Affected config/docs: root ESLint config, `docs/plan.md`, CloudBase/API deployment docs, and integration handoff docs.
- Affected external systems: WeChat DevTools, at least one physical WeChat-capable device, CloudBase dev HTTP function, CloudBase static hosting, and CloudBase dev API access domain.
- No API contract shape changes are intended; this is a readiness, configuration, validation, and evidence-capture change.
