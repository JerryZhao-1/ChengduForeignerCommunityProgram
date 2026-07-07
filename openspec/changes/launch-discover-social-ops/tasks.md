## 1. Social State and Profile APIs

- [ ] 1.1 Add like, favorite, share, and actor interaction contracts [#R1]
  - ACCEPT: Shared contracts support idempotent like/unlike, favorite/unfavorite, share count recording, and actor-specific interaction state.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run focused shared schema/contract/client tests.

- [ ] 1.2 Implement provider-backed social interaction state [#R2]
  - ACCEPT: Mock and CloudBase providers persist interaction records and denormalized counters consistently across refreshes.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API/provider tests for idempotency, counter consistency, unauthorized access, and hidden post handling.

- [ ] 1.3 Add follow relationships and real profile endpoints [#R3]
  - ACCEPT: API supports follow/unfollow and public profile reads with posts, video posts, counts, and followed state; hardcoded profile maps are removed from persisted behavior.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API tests for profile reads, follow toggles, counts, privacy/suspended fallback, and self-follow rejection.

## 2. Mobile Social Experience

- [ ] 2.1 Wire discover detail interactions to persistent APIs [#R4]
  - ACCEPT: Detail like/favorite/share actions update provider-backed state and survive reload; counts match API responses.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for like, favorite, share, reload, and error states.

- [ ] 2.2 Wire profile pages to real profile/follow data [#R5]
  - ACCEPT: Profile page renders API-backed public profile data, posts, video posts, counts, follow state, and safe unavailable-profile states.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for self profile, other profile, follow toggle, and unavailable profile.

## 3. Admin Content Ops and Analytics

- [ ] 3.1 Add content operation contracts and admin UI [#R6]
  - ACCEPT: Admin can manage pinned, featured, recommended, official posts, rank, and tag taxonomy through shared API contracts and audited operations.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run admin typecheck plus MCP GUI runbook for content ops controls, tag edits, save, and refresh.

- [ ] 3.2 Add discover analytics APIs and dashboard [#R7]
  - ACCEPT: Admin analytics shows provider-backed post/comment/report volume, moderation time, active authors, popular associated places/events, engagement, and pending workload for a selected window.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run API analytics tests, admin typecheck, and MCP GUI runbook for dashboard states.

## 4. Live Provider, Docs, and Validation

- [ ] 4.1 Implement CloudBase social/ops live provider scope [#R8]
  - ACCEPT: CloudBase live provider supports verified social interaction, follow, profile, content-ops, tag, notification, and analytics collections or records exact blockers.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/launch-discover-social-ops/<run-folder>/`.
    - Run local provider parity tests and CloudBase live smoke checks when credentials are available; record blockers otherwise.

- [ ] 4.2 Update docs and run strict validation [#R9]
  - ACCEPT: API, admin, CloudBase, and release docs describe social state, profiles, content ops, analytics, notifications, and live/fallback boundaries.
  - TEST: SCOPE: CLI
    - Run `openspec validate launch-discover-social-ops --strict --no-interactive`.
    - Run relevant `pnpm test`, admin/mobile typechecks, and record blockers in the validation bundle.
