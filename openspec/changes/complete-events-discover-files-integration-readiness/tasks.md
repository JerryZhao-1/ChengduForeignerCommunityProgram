## 1. Shared Semantics And Fixtures

- [x] 1.1 Define launch-readiness business guards and shared test fixtures [#R1]
  - ACCEPT: Shared mock/service behavior and fixtures support deterministic events, discover posts, registrations, tickets, file assets, notifications, valid actors, invalid actors, admin actors, and non-admin actors needed to test 6.19-6.21 success and negative paths. Existing public contracts remain the source of truth; no app-local DTO duplication is introduced.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs targeted shared tests for mock service fixtures and contract shape; assertions cover seeded actor roles, public/private file assets, event states, post states, notification ownership, and stable API error code availability.

## 2. Events Readiness

- [x] 2.1 Harden events public list/detail and admin create/update/review visibility [#R2]
  - ACCEPT: `GET /events` and `GET /events/:id` return only launch-visible events for the requested community; admin create/update/review can publish an event and subsequent public reads reflect the latest admin-maintained fields; missing or non-public event detail returns a not-found envelope. Koa routes and CloudBase handler dispatch remain aligned.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-2.1__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs API route and CloudBase handler tests that create draft/rejected/published events, assert public visibility boundaries, assert admin publish propagation, and assert standard success/error envelopes.

- [x] 2.2 Harden event registration, ticket retrieval, and check-in negative paths [#R3]
  - ACCEPT: Registration creates exactly one confirmed registration and valid private ticket for an eligible event; duplicate registration, unavailable event, full/closed event, invalid input, ticket ownership mismatch, missing ticket, wrong-event ticket, already-used ticket, and non-admin check-in return stable envelopes without partial mutation.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-2.2__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs targeted events tests; assertions cover successful registration/ticket/check-in, duplicate conflict, capacity/closed signup conflict, ticket owner denial, non-admin forbidden check-in, and no extra registrations/tickets after rejected requests.

## 3. Discover Readiness

- [x] 3.1 Harden discover public feed/detail and post creation moderation state [#R4]
  - ACCEPT: `GET /discover/posts` and `GET /discover/posts/:id` expose only visible posts for the requested community; hidden, deleted, reported-if-configured-hidden, and review-only posts do not leak through public reads; new post creation uses a deterministic launch moderation state and invalid input does not create partial posts.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-3.1__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs discover feed/detail/create tests; assertions cover visible-only list/detail, hidden/deleted not-found behavior, create success state, validation failure, and response envelope shape.

- [x] 3.2 Harden discover comments, reports, and admin moderation [#R5]
  - ACCEPT: Comments can be created only for visible posts; missing/hidden/deleted posts reject comment creation without orphan comments; report updates or records the governance state; authorized moderation affects public visibility; non-admin moderation is forbidden and does not mutate post state.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-3.2__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs comment/report/moderation API tests; assertions cover successful comment, comment rejection for unavailable post, report behavior, admin hide/delete impact on public reads, non-admin forbidden moderation, and no unintended state mutation.

## 4. Files, Auth, Roles, And Notifications

- [x] 4.1 Harden file upload completion and private URL access boundaries [#R6]
  - ACCEPT: Allowed public upload request/complete flows register active file assets with traceability fields; non-admin actors cannot create or complete protected place gallery, ticket, export, or admin file assets; private URL requests for missing files or unauthorized actors are denied without returning a temporary URL.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-4.1__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs files API tests; assertions cover public upload success, protected upload/complete forbidden responses, private URL owner/permission denial, missing file not-found behavior, and no protected asset registration after rejected requests.

- [x] 4.2 Harden actor resolution, admin role checks, and notification ownership [#R7]
  - ACCEPT: Known mock actors resolve predictably; unknown or inactive actor identities return an unauthorized envelope and do not run protected mutations; protected admin routes return forbidden for non-admin actors; notification list/read exposes only the actor's notifications and cannot mutate another user's notification.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-4.2__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs auth/role/notification API tests; assertions cover valid actor resolution, invalid actor unauthorized response, protected route denial without mutation, notification list ownership, mark-read success, and cross-user mark-read denial.

## 5. CloudBase Handler Parity And Documentation

- [x] 5.1 Keep Koa route and CloudBase handler behavior aligned for hardened non-places paths [#R8]
  - ACCEPT: CloudBase handler dispatch covers the same hardened events, discover, files, notifications, auth, and admin route semantics as the Koa app for the implemented local/API scope. Tests distinguish handler parity from CloudBase live provider persistence.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-5.1__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs CloudBase handler parity tests for representative success and negative paths across events, discover, files, notifications, and auth; assertions record which checks use fallback provider behavior rather than live CloudBase data.

- [x] 5.2 Update sprint and deployment docs with evidence-based 6.19-6.21 status [#R9]
  - ACCEPT: `docs/plan.md` and relevant API/deployment docs record completed 6.19-6.21 local/API readiness checks, remaining P1 or blocker items, and explicit CloudBase non-places live provider status. The docs do not claim production readiness or live persistence beyond verified evidence.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-5.2__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs documentation grep/assertions proving the sprint plan mentions events, discover, files, notifications, auth/role readiness status, test evidence, and non-places CloudBase live-provider limitations.

## 6. Final Validation

- [x] 6.1 Run final OpenSpec and affected project validation [#R10]
  - ACCEPT: The change passes strict OpenSpec validation; affected shared/API tests pass; affected package typechecks pass; lint is run or any generated-bundle lint blocker is documented with exact path and reason. Final validation evidence exists under the change's append-only `auto_test_openspec` folder.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-discover-files-integration-readiness/run-<RUN4>__task-6.1__ref-R10__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include `openspec validate complete-events-discover-files-integration-readiness --strict --no-interactive`, targeted `pnpm test` or `vitest` output, affected package `typecheck` output, and lint output or a scoped lint-blocker record.
