## 1. Governance Data and API

- [ ] 1.1 Add report case, moderation, user enforcement, and audit schemas/contracts [#R1]
  - ACCEPT: Shared contracts cover post/comment report cases, report evidence references, moderation actions, user enforcement state, and audit records.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run focused shared schema/contract/client tests.

- [ ] 1.2 Implement admin discover governance API routes and providers [#R2]
  - ACCEPT: Admin APIs list/filter posts, comments, reports, users, and audit records; actions hide/restore/delete content, resolve reports, and enforce users with role checks.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run API tests for report creation/resolution, content moderation, user enforcement, forbidden access, and audit creation.

- [ ] 1.3 Implement report evidence upload and protected access [#R3]
  - ACCEPT: Mobile reports can attach evidence files; admin report detail can access evidence through authorized temporary URLs; public payloads never expose evidence.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run focused file/report API tests for evidence upload, admin read, public non-leakage, and unauthorized access.

## 2. Admin Governance Console

- [ ] 2.1 Replace admin posts skeleton with moderation queues and filters [#R4]
  - ACCEPT: Admin UI provides tabs/filters for all posts, visible, pending/review, reported, hidden, deleted, comments, reports, users, and audit history.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run admin typecheck plus MCP GUI runbook for queue navigation, filters, loading, empty, and error states.

- [ ] 2.2 Add post/comment/report detail drawers and batch actions [#R5]
  - ACCEPT: Admin can inspect content, media, author, comments, reports, history, public preview context, and perform batch moderation where supported.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run admin typecheck plus MCP GUI runbook for drawer review, single action, batch action, and refresh behavior.

- [ ] 2.3 Add user governance workflow [#R6]
  - ACCEPT: Admin can inspect user profile summary, post/comment/report/violation history, role flags, enforcement status, and warn/mute/ban/restore with reason.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/harden-discover-governance-console/<run-folder>/`.
    - Run admin typecheck plus MCP GUI runbook for user detail and enforcement state transitions.

## 3. Docs and Validation

- [ ] 3.1 Update docs and run strict validation [#R7]
  - ACCEPT: API docs describe governance endpoints, evidence privacy, audit semantics, and user enforcement assumptions.
  - TEST: SCOPE: CLI
    - Run `openspec validate harden-discover-governance-console --strict --no-interactive`.
    - Run relevant `pnpm test`, admin typecheck, and record blockers in the validation bundle.
