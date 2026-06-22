## Why

The project needs a verified CloudBase `dev` API entry before mobile `cloudbase-function`, Admin hosting, and live places acceptance can continue. Current documentation records local places readiness, but the active CloudBase MCP session was not authenticated and `community-map-api` is still recorded as an Event placeholder rather than a verified dev HTTP function.

## What Changes

- Refresh `docs/plan.md` so project progress is judged by completed work and live verification evidence, not by the original calendar dates.
- Re-establish CloudBase MCP access for `cloud1-d7gxdk8t43bd639c0`, or record the exact authentication/permission blocker if access cannot be restored.
- Confirm the current CloudBase `dev` environment inventory in real time:
  - environment identity and region
  - document database collections and places indexes
  - `community-map-api` function status
  - HTTP access/gateway route status
  - static hosting status
- Update deployment registration docs with verified CloudBase state, including differences from older Week 4/Week 8 records.
- Deploy or repair `community-map-api` as the formal CloudBase `dev` HTTP API entry for this repository.
- Confirm function entry, runtime, required environment variables, function permissions, and logs.
- Create or confirm the `/api` access route only after the function entry is verified.
- Run `/health` and places read smoke checks through the CloudBase dev access domain, capturing requestId/log evidence for success or failure.
- Keep production CloudBase resources and production data out of scope.

## Capabilities

### New Capabilities

- `cloudbase-dev-api-deployment`: Covers CloudBase `dev` MCP session verification, resource inventory, `community-map-api` HTTP function deployment/repair, `/api` route confirmation, smoke checks, and deployment evidence recording.

### Modified Capabilities

- None.

## Impact

- Affected code:
  - `apps/api/src/**`
  - `apps/api/package.json`
  - CloudBase function deployment packaging or bootstrap files if needed
- Affected docs:
  - `docs/plan.md`
  - `docs/cloudbase-week4-deployment-baseline.md`
  - `docs/week8-places-cloudbase-integration.md`
  - any deployment registration document added or updated for the dev API smoke evidence
- Affected OpenSpec work:
  - This change supplies the focused deployment closure for the CloudBase items that remain open in `complete-week8-places-cloudbase-integration-and-volunteer-import`.
- Affected systems:
  - CloudBase `dev` environment `cloud1-d7gxdk8t43bd639c0`
  - CloudBase function `community-map-api`
  - CloudBase HTTP access/gateway route prefix `/api`
  - CloudBase dev access domain `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com`
  - CloudBase static hosting status for the recorded Admin dev domain
- No production CloudBase environment, production route, production collection, production storage object, or real user data mutation is in scope.
