## 1. CloudBase Session And Inventory

- [ ] 1.1 Re-authenticate CloudBase MCP and bind or explicitly target `cloud1-d7gxdk8t43bd639c0` [#R1]
  - ACCEPT: The active CloudBase MCP session is either authenticated and targeted at `cloud1-d7gxdk8t43bd639c0`, or the exact auth/permission blocker is recorded with tool output and next action.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI/MCP checks: capture CloudBase auth status and targeted env id, or capture `AUTH_REQUIRED`/permission output and suggested auth action.

- [ ] 1.2 Query and reconcile CloudBase dev resource inventory [#R2]
  - ACCEPT: Live queries record env identity, collections, places indexes, `community-map-api` function metadata, gateway or HTTP access route status, hosting status, and recent relevant logs; failed categories are recorded as blockers rather than confirmed.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI/MCP checks: capture resource query outputs for environment, database collections/indexes, functions, gateway/routes, hosting, and logs.

- [ ] 1.3 Update `docs/plan.md` and deployment registration docs with inventory status [#R3]
  - ACCEPT: `docs/plan.md`, `docs/cloudbase-week4-deployment-baseline.md`, and the relevant Week 8/deployment evidence docs reflect current CloudBase verification state, differences from older records, and unresolved blockers without relying on plan dates as completion evidence.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-1.3__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: docs mention actual auth/env/function/route/hosting status and do not claim CloudBase live verification when MCP/API evidence is missing.

## 2. Dev HTTP Function Deployment

- [ ] 2.1 Prepare the deployable HTTP function entry for `community-map-api` [#R4]
  - ACCEPT: The repository has a documented deployable CloudBase HTTP function entry/package that reuses the canonical API behavior for `/health` and places reads, includes required bootstrap/runtime files if needed, and avoids treating the existing Event placeholder as verified HTTP behavior.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-2.1__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API package typecheck passes and deployment instructions identify the HTTP entry, runtime, port/boot behavior, and package contents.

- [ ] 2.2 Deploy or repair `community-map-api` in CloudBase dev [#R5]
  - ACCEPT: `community-map-api` is deployed or confirmed in `cloud1-d7gxdk8t43bd639c0` with the intended runtime, entry, env vars, permission boundary, and recent logs; if deployment fails, CloudBase logs or a log-access blocker are captured.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-2.2__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI/MCP checks: capture deploy/update output, function metadata, env vars, runtime, permission/security rule status, and log query evidence.

- [ ] 2.3 Verify direct function health behavior and requestId/log traceability [#R6]
  - ACCEPT: A direct function or access-domain health check reaches the intended API entry and returns a stable health response with requestId/log traceability where the envelope supports it; failures include status, body summary, requestId when present, and logs.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-2.3__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: health smoke output and matching CloudBase log evidence are captured.

## 3. `/api` Route And Smoke Acceptance

- [ ] 3.1 Create or confirm CloudBase HTTP access `/api` route after function verification [#R7]
  - ACCEPT: `/api` is created or confirmed only after `community-map-api` health verification passes; the final route target, rewrite behavior, and dev access URL shape are documented. If function verification fails, route creation remains deferred with the blocker recorded.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-3.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI/MCP checks: capture gateway/route query or update output and route smoke URLs.

- [ ] 3.2 Run `/api/health` and public places read smoke through the dev access domain [#R8]
  - ACCEPT: The dev access domain can call `/api/health` and places public read endpoints (`/api/places`, `/api/places/map-markers`, and one detail endpoint when published data exists), or each failing smoke has CloudBase logs and requestId evidence.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-3.2__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: curl or equivalent HTTP outputs, response body summaries, status codes, requestIds, and CloudBase logs are captured.

- [ ] 3.3 Prove places smoke is using CloudBase live provider configuration, not mock fallback [#R9]
  - ACCEPT: Function configuration and smoke evidence show `API_PROVIDER=cloudbase`, `CLOUDBASE_PROVIDER_MODE=live`, and the target env id are active before places smoke is accepted as live.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-3.3__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI/MCP checks: capture function env var metadata and smoke output that distinguishes live data from mock-only behavior where possible.

## 4. Documentation And Final Gate

- [ ] 4.1 Sync final CloudBase deployment evidence and remaining plan items [#R10]
  - ACCEPT: Deployment docs and `docs/plan.md` record the final 6.16/6.17 outcome as verified success or concrete blocker, including function, route, health, places smoke, logs, and remaining development plan items.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-4.1__ref-R10__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: docs include exact CloudBase env id, function name, route status, dev access domain, requestId/log evidence references, and known blockers.

- [ ] 4.2 Run final OpenSpec and project validation for the changed scope [#R11]
  - ACCEPT: The change passes strict OpenSpec validation, relevant project validation for touched files passes, and validation bundles exist for completed tasks.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-api-deployment/run-<RUN4>__task-4.2__ref-R11__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `openspec validate complete-cloudbase-dev-api-deployment --strict --no-interactive` plus affected package typecheck/test commands are captured with success or documented environment-only blockers.
