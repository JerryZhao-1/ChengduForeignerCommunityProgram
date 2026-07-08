## 1. Association Contracts and API

- [x] 1.1 Extend discover post inputs and payloads for place/event associations [#R1]
  - ACCEPT: Shared schemas and clients support nullable `place_id` and `event_id` on posts with validation-ready create inputs.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run focused shared schema/contract/client tests.

- [x] 1.2 Add provider validation for associated places and events [#R2]
  - ACCEPT: Create rejects missing, unpublished, unavailable, cross-community, or moderated associations and preserves public visibility boundaries.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run API tests for valid/invalid place/event association and hidden content non-leakage.

- [x] 1.3 Add related discover queries for places and events [#R3]
  - ACCEPT: API/provider exposes lightweight visible related posts by place id and event id, with paging or bounded result size.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run API tests for related posts, moderated post exclusion, and unavailable place/event behavior.

## 2. Mobile Cross-Module Experience

- [x] 2.1 Add place/event selection and cards to discover create/detail [#R4]
  - ACCEPT: Users can attach a visible place/event while creating a post; detail renders safe association cards and unavailable association fallbacks.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for attach place, attach event, detail card navigation, and invalid fallback states.

- [x] 2.2 Add related discover sections to place and event detail [#R5]
  - ACCEPT: Published place and public event detail pages show visible related posts when present and remain clean without placeholder copy when none exist.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for place related posts, event related posts, empty state, and navigation to discover detail.

- [x] 2.3 Replace hardcoded discover author data with profile-backed summaries [#R6]
  - ACCEPT: Discover author cards and profile navigation use API-backed user/profile summaries and safe fallbacks for unavailable profiles.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for author rendering and profile navigation.

## 3. Notifications and Documentation

- [x] 3.1 Add discover-triggered notification events [#R7]
  - ACCEPT: New comments, moderation outcomes, eligible cross-module discussion events, and report resolutions backed by the `harden-discover-governance-console` report-case workflow create owner-safe notifications with valid navigation metadata; if that workflow is not implemented yet, report-resolution notifications are documented as deferred rather than claimed complete.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/connect-discover-to-community-modules/<run-folder>/`.
    - Run focused notifications/API tests for ownership, self-notification suppression, hidden-content handling, and mark-read behavior.

- [x] 3.2 Update docs and run strict validation [#R8]
  - ACCEPT: API docs describe association fields, related queries, profile summaries, and discover notification behavior.
  - TEST: SCOPE: CLI
    - Run `openspec validate connect-discover-to-community-modules --strict --no-interactive`.
    - Run relevant `pnpm test`, mobile typecheck, and record blockers in the validation bundle.
