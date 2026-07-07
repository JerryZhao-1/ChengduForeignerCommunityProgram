## 1. Shared/API Core Model

- [ ] 1.1 Extend discover schemas, contracts, paths, clients, and fixtures [#R1]
  - ACCEPT: `Post` includes durable timestamps, counters, nullable `place_id` / `event_id`, and author display summary; comments include visibility status; shared client exposes comment list and current-user post APIs.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run focused shared contract/client/schema tests and record outputs.

- [ ] 1.2 Add API routes and provider methods for comments and my posts [#R2]
  - ACCEPT: API supports paged `GET /discover/posts/:id/comments` and `GET /discover/me/posts`; public visibility and owner visibility match the specs.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run focused API tests for comment read/write, unavailable post comments, owner posts, and public hidden-post behavior.

- [ ] 1.3 Implement post media upload and binding [#R3]
  - ACCEPT: User-facing post media uses controlled `public/posts/` upload/complete flow and binds authorized file assets to created posts.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run focused file/discover API tests for allowed post media upload, forbidden path misuse, and unauthorized media binding.

- [ ] 1.4 Implement CloudBase live discover core provider [#R4]
  - ACCEPT: CloudBase live provider persists posts, comments, owner posts, and post media binding or records explicit live blockers without claiming readiness.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run local provider parity tests and CloudBase live smoke checks when credentials are available; record blockers otherwise.

## 2. Mobile Core Experience

- [ ] 2.1 Replace hardcoded detail comments with API-backed comment reads [#R5]
  - ACCEPT: Discover detail loads comments from API, refreshes after submit, and no longer treats hardcoded fixtures as persisted comments.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for detail load, comment submit, reload, loading, empty, and error states.

- [ ] 2.2 Replace URL-only post creation with media picker upload flow [#R6]
  - ACCEPT: Mobile create supports selecting images/videos, upload progress/error states, removal, and submit with bound file ids; URL paste is not the primary production path.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for create post with media and text-only fallback.

- [ ] 2.3 Implement API-backed my-posts page [#R7]
  - ACCEPT: `pages/more/my-posts` loads current actor posts, shows status, supports detail navigation, and removes phase-placeholder copy.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/complete-discover-core-content-loop/<run-folder>/`.
    - Run mobile typecheck plus MCP GUI runbook for my-posts list, empty, and hidden-owned post display.

## 3. Docs and Validation

- [ ] 3.1 Update docs and run strict validation [#R8]
  - ACCEPT: API docs and CloudBase docs describe comment reads, my posts, post media upload, new fields, and discover live provider status.
  - TEST: SCOPE: CLI
    - Run `openspec validate complete-discover-core-content-loop --strict --no-interactive`.
    - Run relevant `pnpm test`, package typechecks, and record any blockers in the validation bundle.
