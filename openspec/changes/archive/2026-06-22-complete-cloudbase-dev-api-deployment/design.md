## Context

The repository has local places readiness, shared contracts, mock/Koa behavior, and documentation for CloudBase `dev`, but the live CloudBase deployment path is not closed. The latest recorded CloudBase MCP check returned `AUTH_REQUIRED`, so the active tool session did not verify the environment, collections, indexes, function, gateway, hosting, or logs.

`docs/cloudbase-week4-deployment-baseline.md` records `community-map-api` as `existing / Active / Event / Nodejs18.15`, with `/api` route creation deferred until the API is deployed as the formal HTTP function. The mobile client already supports `cloudbase-function` mode and prefers `wx.cloud.callHTTPFunction`, which means the dev API must be reachable as an HTTP function or equivalent CloudBase HTTP access route rather than only as an event function placeholder.

The current `apps/api/src/app.ts` exposes the canonical Koa route set. `apps/api/src/cloudbase.ts` exports `main(event, context)` and manually normalizes Event/Integration-style calls. That file is useful for compatibility but is not, by itself, a true CloudBase HTTP function server listening on the expected HTTP runtime port.

## Goals / Non-Goals

**Goals:**

- Make the CloudBase `dev` connection state explicit: verified access to `cloud1-d7gxdk8t43bd639c0`, or a concrete authentication/permission blocker.
- Verify and record current dev resources before mutating them.
- Deploy or repair `community-map-api` as the dev HTTP API entry that can serve `/health` and places reads through the CloudBase dev access domain.
- Confirm required runtime, entry, environment variables, permissions, logs, and requestId traceability.
- Create or confirm the `/api` route only after the function entry is verified.
- Update deployment registration docs and `docs/plan.md` with evidence-based status.

**Non-Goals:**

- No production CloudBase environment setup or production data mutation.
- No broad rewrite of events, discover, files, notifications, or auth live providers.
- No change to shared places API contracts unless smoke testing exposes an implementation defect.
- No claim that CloudBase resources are verified without live MCP/API evidence from the active session.

## Decisions

### Use CloudBase MCP as the primary source of live resource truth

Use CloudBase MCP for auth, environment binding, resource inventory, function/gateway operations, hosting status, and logs whenever available. CLI output or console screenshots may supplement evidence, but MCP results are the authoritative machine-readable record for this change.

Alternative considered: rely on existing Week 4 documentation. That is insufficient because the user explicitly needs current state and the latest run showed `AUTH_REQUIRED`.

### Treat `community-map-api` as an HTTP API deployment, not an Event placeholder

The deployment must either package a true HTTP function entry that listens on the CloudBase HTTP runtime port and reuses `createApp()`, or use the CloudBase-supported HTTP function mechanism that proves requests from the dev access domain reach the Koa route set. The existing `main(event, context)` path can remain as a compatibility entry, but it must not be the only evidence for the dev HTTP API.

Alternative considered: keep deploying `apps/api/src/cloudbase.ts` through `@cloudbase/functions-framework` and mark the function complete. That would preserve the current Event placeholder ambiguity and would not prove `wx.cloud.callHTTPFunction` or `/api` route behavior.

### Gate `/api` route creation on function verification

Only create or confirm `/api` after `community-map-api` has verified runtime, entry behavior, environment variables, permissions, and health response. If auth or function deployment fails, record the exact blocker and leave `/api` deferred.

Alternative considered: pre-create `/api` and repair the function later. That risks a public route pointing at a broken or wrong entry and conflicts with the existing Week 8 gate.

### Keep smoke acceptance intentionally narrow

This change verifies `/health` plus public places reads through the dev access domain. Full places live acceptance for admin mutations, gallery media, imported draft visibility, and published update visibility remains tracked by the Week 8 CloudBase acceptance work unless those checks are explicitly completed as follow-up evidence.

Alternative considered: absorb the entire Week 8 acceptance scope. That would make this change too broad and duplicate the existing active Week 8 change.

### Record blockers as valid exit evidence

If CloudBase MCP auth, permission, function deploy, gateway, logs, or smoke checks fail, the implementation must capture the failing tool output, status code, requestId when present, and next action. A well-documented blocker satisfies the 6.16/6.17 exit criteria better than an unverified success claim.

Alternative considered: leave blocked tasks unchecked without evidence. That does not help project planning or handoff.

## Risks / Trade-offs

- [Risk] CloudBase MCP authentication cannot be restored in the active session. -> Mitigation: record `AUTH_REQUIRED` or permission output with the suggested auth mode, keep deployment tasks blocked, and do not mark resources verified.
- [Risk] Existing `community-map-api` uses an Event runtime that conflicts with HTTP function deployment. -> Mitigation: inspect runtime metadata first, then deploy an HTTP entry/package that reuses `createApp()` while preserving compatibility entry behavior where needed.
- [Risk] CloudBase gateway route shape rewrites paths unexpectedly, for example `/api/health` reaching the function as `/health` or `/api/health`. -> Mitigation: smoke both expected forms when configuring the route and document the final public URL shape.
- [Risk] Places smoke falls back to mock provider, producing false confidence. -> Mitigation: verify `API_PROVIDER=cloudbase`, `CLOUDBASE_PROVIDER_MODE=live`, and env id in function configuration before accepting places smoke.
- [Risk] Logs are unavailable even though HTTP calls fail. -> Mitigation: capture response status/body, requestId if emitted, function/gateway query output, and the missing-log blocker.

## Migration Plan

1. Re-authenticate CloudBase MCP and bind or explicitly target `cloud1-d7gxdk8t43bd639c0`.
2. Query dev environment, collections, places indexes, `community-map-api`, gateway routes, hosting, and recent logs without making mutations.
3. Update docs with the inventory result or blocker.
4. Prepare and deploy the dev HTTP function entry/package for `community-map-api`, including runtime and environment variables.
5. Verify direct function health behavior and logs.
6. Create or confirm `/api` route only after the function is verified.
7. Smoke `/api/health`, `/api/places`, `/api/places/map-markers`, and one published place detail when data exists.
8. Record requestId/log evidence, update deployment docs, and run OpenSpec/project validation.

Rollback is limited to dev resources: if the HTTP deployment breaks existing behavior, restore the previous `community-map-api` deployment package or remove the new `/api` route, then record the rollback in deployment docs. No production rollback is required because production resources are out of scope.

## Open Questions

- Does the CloudBase console currently classify `community-map-api` as Event, HTTP function, or a gateway-backed Event function after re-authentication?
- Which exact gateway route rewrite form does CloudBase apply for `/api` in this environment?
- Are places live data and indexes still present in `cloud1-d7gxdk8t43bd639c0`, or do they need reseeding before smoke can prove non-mock reads?
