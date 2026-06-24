## Why

The 6.19-6.21 sprint gates are still blocking full-module integration because `events`, `discover`, `files`, `notifications`, and auth/role negative paths are only partially hardened beyond happy-path demo flows. The project needs these modules to reach a stable local/API integration baseline before the 6.24 all-module smoke window can be treated as meaningful.

## What Changes

- Harden the `events` minimum launch path across public list/detail, registration, ticket retrieval, admin create/update/review, check-in, and required negative paths.
- Harden the `discover` minimum launch path across public feed/detail, post creation, comment creation, report/governance, admin moderation, and public visibility boundaries.
- Harden file, notification, auth, role, and permission behavior for integration-critical routes, especially public/private file access denial, notification ownership/read state, invalid actor handling, and admin permission denial.
- Add route/provider tests and validation evidence that prove success paths, validation failures, permission failures, not-found behavior, visibility boundaries, duplicate/conflict paths, and envelope shape.
- Update the sprint plan after implementation so 6.19-6.21 items are marked from evidence rather than date-based assumptions.
- Keep CloudBase non-places live provider persistence as a documented follow-up unless explicitly implemented during the change; this change must not claim production data readiness without live evidence.

## Capabilities

### New Capabilities

- `events-integration-readiness`: Minimum launch behavior and negative paths for events registration, ticketing, check-in, and admin maintenance.
- `discover-integration-readiness`: Minimum launch behavior and visibility rules for posts, comments, reports, moderation, and public feed/detail reads.
- `files-auth-notifications-readiness`: Integration-critical file access, notification state, auth actor, role, and permission boundaries.

### Modified Capabilities

- `cloudbase-dev-api-deployment`: Document that non-places live providers remain outside the verified CloudBase live scope unless this change adds and validates them.

## Impact

- Affected shared layer: `packages/shared/src/schemas/*`, `packages/shared/src/contracts/*`, `packages/shared/src/mock/*`, shared tests.
- Affected API layer: `apps/api/src/routes/*`, `apps/api/src/providers/*`, `apps/api/src/cloudbase.ts`, API route tests.
- Affected clients/UI where needed: `apps/mobile/src/pages/events`, `apps/mobile/src/pages/discover`, `apps/mobile/src/pages/more`, `apps/admin/src/pages/EventsPage.vue`, `apps/admin/src/pages/PostsPage.vue`, admin/mobile API clients.
- Affected docs and evidence: `docs/plan.md`, relevant API/deployment docs, `auto_test_openspec/complete-events-discover-files-integration-readiness/`.
