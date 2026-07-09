## 1. Social State and Profile APIs

- [x] 1.1 Add like, favorite, share, and actor interaction contracts [#R1]
  - ACCEPT: Shared contracts support idempotent like/unlike, favorite/unfavorite, share count recording, and actor-specific interaction state.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run focused shared schema/contract/client tests.
  - BUNDLE (RUN #1): shared discover social contract/client tests | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0001__task-1.1__ref-R1__20260708T160605Z | HOW_TO_RUN: run.sh/run.bat

- [x] 1.2 Implement provider-backed social interaction state [#R2]
  - ACCEPT: Mock and CloudBase providers persist interaction records and denormalized counters consistently across refreshes.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API/provider tests for idempotency, counter consistency, unauthorized access, and hidden post handling.
  - BUNDLE (RUN #2): API/provider social interaction tests | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0002__task-1.2__ref-R2__20260708T161007Z | HOW_TO_RUN: run.sh/run.bat

- [x] 1.3 Add follow relationships and real profile endpoints [#R3]
  - ACCEPT: API supports follow/unfollow and public profile reads with posts, video posts, counts, and followed state; hardcoded profile maps are removed from persisted behavior.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API tests for profile reads, follow toggles, counts, privacy/suspended fallback, and self-follow rejection.
  - BUNDLE (RUN #3): profile/follow contract and API tests | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0003__task-1.3__ref-R3__20260708T161406Z | HOW_TO_RUN: run.sh/run.bat

## 2. Mobile Social Experience

- [x] 2.1 Wire discover detail interactions to persistent APIs [#R4]
  - ACCEPT: Detail like/favorite/share actions update provider-backed state and survive reload; counts match API responses.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for like, favorite, share, reload, and error states.
  - BUNDLE (RUN #4): mobile typecheck and MCP GUI runbook for discover detail social actions | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0004__task-2.1__ref-R4__20260708T161606Z | HOW_TO_RUN: run.sh/run.bat

- [x] 2.2 Wire profile pages to real profile/follow data [#R5]
  - ACCEPT: Profile page renders API-backed public profile data, posts, video posts, counts, follow state, and safe unavailable-profile states.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for self profile, other profile, follow toggle, and unavailable profile.
  - BUNDLE (RUN #5): mobile typecheck and MCP GUI runbook for API-backed profile/follow pages | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0005__task-2.2__ref-R5__20260708T161835Z | HOW_TO_RUN: run.sh/run.bat

## 3. Admin Content Ops and Analytics

- [x] 3.1 Add content operation contracts and admin UI [#R6]
  - ACCEPT: Admin can manage pinned, featured, recommended, official posts, rank, and tag taxonomy through shared API contracts and audited operations.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run admin typecheck plus MCP GUI runbook for content ops controls, tag edits, save, and refresh.
  - BUNDLE (RUN #6): admin typecheck, API contract tests, and MCP GUI runbook for content ops/tag taxonomy | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0006__task-3.1__ref-R6__20260708T162443Z | HOW_TO_RUN: run.sh/run.bat

- [x] 3.2 Add discover analytics APIs and dashboard [#R7]
  - ACCEPT: Admin analytics shows provider-backed post/comment/report volume, moderation time, active authors, popular associated places/events, engagement, and pending workload for a selected window.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API analytics tests, admin typecheck, and MCP GUI runbook for dashboard states.
  - BUNDLE (RUN #7): admin typecheck, API analytics tests, and MCP GUI runbook for analytics dashboard | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0007__task-3.2__ref-R7__20260708T162825Z | HOW_TO_RUN: run.sh/run.bat

## 4. Live Provider, Docs, and Validation

- [x] 4.1 Implement CloudBase social/ops live provider scope [#R8]
  - ACCEPT: CloudBase live provider supports verified social interaction, follow, profile, content-ops, tag, notification, and analytics collections or records exact blockers.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run local provider parity tests and CloudBase live smoke checks when credentials are available; record blockers otherwise.
  - BUNDLE (RUN #8): CloudBase provider parity tests for social/ops plus notification live-delivery blocker note | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0008__task-4.1__ref-R8__20260708T163117Z | HOW_TO_RUN: run.sh/run.bat

- [x] 4.2 Update docs and run strict validation [#R9]
  - ACCEPT: API, admin, CloudBase, and release docs describe social state, profiles, content ops, analytics, notifications, and live/fallback boundaries.
  - TEST: SCOPE: CLI
    - Run `openspec validate launch-discover-social-ops --strict --no-interactive`.
    - Run relevant `pnpm test`, admin/mobile typechecks, and record blockers in the validation bundle.
  - BUNDLE (RUN #9): docs updates, strict OpenSpec validation, pnpm ignored-build blocker record, direct Vitest fallback, admin/mobile typechecks | VALIDATION_BUNDLE: auto_test_openspec/launch-discover-social-ops/run-0009__task-4.2__ref-R9__20260708T163553Z | HOW_TO_RUN: run.sh/run.bat
