## 1. Quality Gates

- [x] 1.1 Resolve release validation blockers from the local E2E run [#R1]
  - ACCEPT: `pnpm typecheck`, `pnpm test`, and `pnpm lint` pass from the repository root; the Discover post-order failures are resolved by matching the intended latest-first behavior or by correcting the implementation; the unused `_input` lint failure is removed without weakening lint rules.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST run `pnpm typecheck`, `pnpm test`, and `pnpm lint`, capture stdout/stderr to `logs/`, and fail on non-zero exit codes or known failing test names.
  - BUNDLE (RUN #1): Worker bundle for root typecheck/test/lint gate and known blocker assertions | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0001__task-1.1__ref-R1__20260709T065611Z | HOW_TO_RUN: run.sh/run.bat

## 2. Production-Like API Target

- [x] 2.1 Establish a WeChat-reachable API target for Mini Program production acceptance [#R2]
  - ACCEPT: The Mini Program production-acceptance build uses CloudBase function mode or an approved HTTPS API domain instead of `127.0.0.1`, localhost, LAN IP, or mock-only endpoints; health, Places public reads, Events registration/ticket/check-in, Discover create/comment/interaction/report, and Admin governance smoke checks pass against that target.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.1__ref-R2__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `inputs/` MUST declare the API base target and actor/admin credentials or mock-safe equivalents approved for acceptance.
    - `run.sh` and `run.bat` MUST execute the smoke requests, write response JSON to `outputs/`, and verify success envelopes, expected identifiers, and absence of localhost/LAN endpoints.
  - BUNDLE (RUN #2): Worker bundle for CloudBase API target build config and end-to-end API smoke | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0002__task-2.1__ref-R2__20260709T070257Z | HOW_TO_RUN: run.sh/run.bat

- [x] 2.2 Replace or classify mock actor usage for production acceptance [#R3]
  - ACCEPT: Production acceptance documentation and config distinguish local `x-mock-user-id` behavior from the identity/role mechanism used by the production-like API target; Admin-only actions have an accepted operator identity path or remain production blockers.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.2__ref-R3__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST inspect config/docs and run role-sensitive API checks where available, then assert that production acceptance does not depend on undocumented mock actor headers.
  - BUNDLE (RUN #3): Worker bundle for identity classification docs/config and role-sensitive CloudBase API checks | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0003__task-2.2__ref-R3__20260709T080441Z | HOW_TO_RUN: run.sh/run.bat

## 3. Mini Program Platform Flows

- [x] 3.1 Repair or relabel Places detail sharing behavior [#R4]
  - ACCEPT: A button labelled as sharing invokes native WeChat share on true Mini Program devices with the current place title/path/image, or the UI explicitly labels the action as copying a link; tapping share MUST NOT silently only copy `/pages/places/detail?id=<id>` while presenting itself as native sharing.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.1__ref-R4__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `logs/`, and `tests/gui_runbook_places_share.md`.
    - `run.sh` and `run.bat` MUST be start-server only for the GUI portion and print the Mini Program/H5/Admin URLs needed by the Supervisor; CLI assertions may be documented as exact commands in `task.md`.
    - `tests/gui_runbook_places_share.md` MUST require MCP-driven true-device or DevTools evidence for native share/fallback behavior and screenshot/log paths under `outputs/`.
  - BUNDLE (RUN #4): Worker bundle for Places native share/fallback implementation checks and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0004__task-3.1__ref-R4__20260709T080744Z | HOW_TO_RUN: run.sh/run.bat; static CLI check documented in task.md

- [x] 3.2 Validate Places navigation and map fallback on true Mini Program devices [#R5]
  - ACCEPT: Places map, list, detail, "view map location", and navigation flows work on true devices with valid coordinates; denied permission or platform failure shows a recoverable fallback and is recorded with exact platform message.
  - TEST: SCOPE: GUI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.2__ref-R5__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `logs/`, `outputs/`, and `tests/gui_runbook_places_navigation.md`.
    - `run.sh` and `run.bat` MUST be start-server only and print the relevant URLs/preview instructions.
    - The GUI runbook MUST be MCP-driven and record screenshots plus console/API findings for map, detail focus, navigation launch, and fallback states.
  - BUNDLE (RUN #5): Worker bundle for Places map/navigation fallback CLI checks and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0005__task-3.2__ref-R5__20260709T080951Z | HOW_TO_RUN: run.sh/run.bat; static CLI check documented in task.md

- [x] 3.3 Complete true-device Mini Program tab and platform capability acceptance [#R6]
  - ACCEPT: Home, Events, Discover, Places, and Me load on the supported true-device matrix without white screens or unclassified loading failures; network domains, map/media loading, share state, and permission fallbacks are recorded; root DevTools import is fixed or generated `apps/mobile/dist/dev/mp-weixin` is documented as the canonical validation project.
  - TEST: SCOPE: GUI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.3__ref-R6__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `logs/`, `outputs/`, and `tests/gui_runbook_mini_program_tabs.md`.
    - `run.sh` and `run.bat` MUST be start-server only and print the DevTools/preview command and API target.
    - The GUI runbook MUST capture screenshots and console/API findings for every tab and classify favicon/deprecated warnings separately from business errors.
  - BUNDLE (RUN #6): Worker bundle for Mini Program canonical import path, tab static checks, and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0006__task-3.3__ref-R6__20260709T081119Z | HOW_TO_RUN: run.sh/run.bat; static CLI check documented in task.md

## 4. Events Acceptance

- [x] 4.1 Complete true-device Events registration, ticket, and Admin check-in acceptance [#R7]
  - ACCEPT: On the production-like target, a true-device user can browse Events, open detail, register, view My Registrations, open the ticket, and an Admin can inspect and check in that ticket once with clear repeated-check-in feedback.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/gui_runbook_events_acceptance.md`.
    - `run.sh` and `run.bat` MUST be start-server only for GUI and MAY include CLI API verification only if the bundle cleanly separates it in `task.md`.
    - The runbook MUST record registration id, ticket id, Admin check-in result, repeated-check-in result, screenshots, and API evidence paths.
  - BUNDLE (RUN #7): Worker bundle for Events registration/ticket/check-in/repeated-check-in API smoke and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0007__task-4.1__ref-R7__20260709T081335Z | HOW_TO_RUN: run.sh/run.bat

## 5. Discover Acceptance

- [x] 5.1 Complete true-device Discover content, interaction, report, and governance acceptance [#R8]
  - ACCEPT: On the production-like target, a true-device user can browse Discover, open detail, create a post, comment, like, favorite, share or use the accepted share fallback, submit a report, and an Admin can see governance/report/moderation metadata.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-5.1__ref-R8__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/gui_runbook_discover_acceptance.md`.
    - `run.sh` and `run.bat` MUST be start-server only for GUI and MAY include CLI API verification only if documented as a separate CLI portion.
    - The runbook MUST record post id, comment id, report id, interaction state, screenshots, console/API errors, and Admin governance evidence paths.
  - BUNDLE (RUN #8): Worker bundle for Discover content/comment/interaction/report/Admin governance API smoke and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0008__task-5.1__ref-R8__20260709T081522Z | HOW_TO_RUN: run.sh/run.bat

- [x] 5.2 Harden Discover interaction state against overwrites [#R9]
  - ACCEPT: Sequential and near-concurrent like/favorite/share writes for the same actor and post preserve independent state or return a recoverable conflict/retry response; tests cover the previously observed overwrite risk.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-5.2__ref-R9__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST run focused Vitest/API checks for sequential and near-concurrent Discover interactions, capture logs, and assert final like/favorite/share state.
  - BUNDLE (RUN #9): Worker bundle for focused Discover interaction tests and CloudBase near-concurrent API smoke | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0009__task-5.2__ref-R9__20260709T081854Z | HOW_TO_RUN: run.sh/run.bat

## 6. Release Data, Config, and Handoff

- [x] 6.1 Clean production-preview media, map, domain, and DevTools configuration [#R10]
  - ACCEPT: Production-preview Mini Program builds do not request `https://example.com/public/events/...`; map keys, legal domains, storage/media URLs, and DevTools import path are documented or configured; remaining account/platform dependencies are listed with owner and blocker status.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-6.1__ref-R10__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, `tests/test_cli_config_media.*`, and `tests/gui_runbook_config_media.md`.
    - `run.sh` and `run.bat` MUST be start-server only and print the Mini Program/H5/Admin URLs needed by the Supervisor.
    - `tests/test_cli_config_media.*` MUST scan built/configured artifacts for forbidden fixture domains and capture documented config paths; `task.md` MUST document the exact command for the Supervisor to run and the expected `outputs/` and `logs/` paths.
    - GUI evidence MUST be collected through the MCP runbook screenshots/logs only.
  - BUNDLE (RUN #10): Worker bundle for production-preview config/media scan and GUI runbook | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0010__task-6.1__ref-R10__20260709T082222Z | HOW_TO_RUN: run.sh/run.bat

- [x] 6.2 Produce the production acceptance handoff bundle [#R11]
  - ACCEPT: A dated evidence bundle summarizes module status, environment classification, API target, device matrix, screenshots/logs, command results, blockers, known platform limits, and remaining product/account decisions; upload/review/public-launch recommendation is explicit.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-readiness-acceptance/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-6.2__ref-R11__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST validate the handoff document structure, required evidence links, blocker classifications, command summaries, and final recommendation fields.
  - BUNDLE (RUN #11): Worker bundle for production acceptance handoff document validation | VALIDATION_BUNDLE: auto_test_openspec/production-readiness-acceptance/run-0011__task-6.2__ref-R11__20260709T082416Z | HOW_TO_RUN: run.sh/run.bat
