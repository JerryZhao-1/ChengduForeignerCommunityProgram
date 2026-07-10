## 1. Launch Closure Foundations

- [x] 1.1 Create the public launch ownership matrix and closure status model [#R1]
  - ACCEPT: A launch closure document or section classifies every remaining prerequisite as Codex-owned, human-owned, or mixed; each item includes owner role, required evidence, blocker severity, and the decision state it gates.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST validate that the ownership matrix exists, contains all required ownership classes, names evidence expectations, and does not mark human-owned items complete without evidence.

- [x] 1.2 Produce the detailed human Mini Program public launch manual under `docs/` [#R2]
  - ACCEPT: A detailed `docs/` manual explains WeChat account preparation, certification/filing checks, service categories, privacy disclosures, legal request/upload/download domains, CloudBase console checks, map key checks, true-device validation, review upload/submission, phased/full release, rollback, and post-release monitoring; every manual step states required human evidence.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST assert the manual exists and contains required sections for account, domains, privacy, CloudBase, true devices, review, release, rollback, monitoring, and evidence capture.

- [x] 1.3 Add public launch decision-state handoff template [#R3]
  - ACCEPT: A final handoff template supports exactly one decision state: blocked, ready for WeChat review upload, ready for review submission, ready for phased release, or ready for full public release; it links evidence classes and preserves prior dev/production-like evidence classification.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.3__ref-R3__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST validate the template states, required evidence links, blocker ownership fields, and historical evidence classification wording.

## 2. Production Artifact And Build Hardening

- [x] 2.1 Harden Mini Program public-review build configuration [#R4]
  - ACCEPT: Public-review Mini Program builds use `cloudbase-function` mode, canonical CloudBase env/function settings, and canonical output path; release artifacts no longer retain local API fallback strings or mock actor references that could be mistaken for production behavior; local dev workflows remain documented and usable.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.1__ref-R4__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST run the public-review Mini Program build and verify generated config points to the intended CloudBase function mode without local endpoint fallbacks.

- [x] 2.2 Add production artifact scan for forbidden endpoints fixtures and mock headers [#R5]
  - ACCEPT: A reproducible scan checks generated Mini Program and Admin artifacts for `localhost`, `127.0.0.1`, LAN IP endpoints, `x-mock-user-id`, mock actor production use, fixture media such as `example.com/public/events`, and undocumented API targets; scan reports exact file/path matches and blocks launch on forbidden matches.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.2__ref-R5__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST build or inspect the configured artifacts, run the scanner, write a machine-readable report under `outputs/`, and fail on forbidden production matches.

- [x] 2.3 Resolve canonical DevTools or `miniprogram-ci` public-review upload path [#R6]
  - ACCEPT: Release documentation and config agree on the public-review package path, preferably `apps/mobile/dist/build/mp-weixin`; any dev-only `project.config.json` path is either adjusted or explicitly documented as not for public-review upload.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.3__ref-R6__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST inspect `project.config.json`, build output paths, and release docs for conflicting upload/import paths.

## 3. Admin And CloudBase Public Launch Checks

- [x] 3.1 Verify Admin production auth without mock actor headers [#R7]
  - ACCEPT: Tests or smoke scripts prove `POST /auth/admin/login` returns a Bearer token, protected Admin routes reject unauthenticated callers, invalid tokens, non-admin users, and `x-mock-user-id`-only calls when CloudBase live mode disables mock headers; valid Bearer admin calls succeed according to business rules.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.1__ref-R7__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST run focused API tests or live-target smoke checks for Admin login, Bearer authorization, mock-header rejection, and role enforcement without exposing secrets.

- [x] 3.2 Add CloudBase public-launch target and environment readiness checks [#R8]
  - ACCEPT: A readiness check documents or verifies the selected CloudBase env id, function name, API route, provider mode, required env vars, database collections/index expectations, storage domains, and security-rule status; unknown account-owner console items remain human-owned blockers.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.2__ref-R8__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST inspect available config/docs and optionally run API health checks against a declared target, then output missing CloudBase prerequisites with owner classification.

- [x] 3.3 Verify hosted Admin targets the selected launch API [#R9]
  - ACCEPT: Hosted Admin bundle/config is scanned or smoke-tested to prove it targets the selected public-launch API and not mock, localhost, LAN IP, stale dev endpoints, or undocumented environments; route refresh remains valid for release-relevant Admin paths.
  - TEST: SCOPE: MIXED
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.3__ref-R9__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `logs/`, `tests/test_cli_admin_public_launch.*`, and `tests/gui_runbook_admin_public_launch.md`.
    - `tests/test_cli_admin_public_launch.*` MUST run static hosted-bundle/config checks; `run.sh` and `run.bat` MUST be start-server only and print the Admin URL; GUI evidence MUST be collected through the runbook.

## 4. Content Media And True-Device Evidence

- [x] 4.1 Add production content and media audit [#R10]
  - ACCEPT: A reproducible audit checks public places, events, discover posts, and visible media references for mock fixtures, local URLs, draft leakage, missing required bilingual launch fields, unapproved external media, and missing attribution; it produces blocking issues and human editorial review items separately.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.1__ref-R10__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST run the audit against fixture/export/API input, write a machine-readable report, and fail on blocking public content/media issues.

- [x] 4.2 Create iOS Android true-device public package runbooks and evidence index [#R11]
  - ACCEPT: Runbooks cover Home, Events, Discover, Places, Me, CloudBase calls, legal-domain behavior without debug bypass, map/media loading, upload, location permission fallback, sharing or accepted fallback, Events registration/ticket, Discover create/comment/interaction/report, and Admin governance evidence; an evidence index format records device, WeChat version, package version, screenshots/logs, and result.
  - TEST: SCOPE: GUI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.2__ref-R11__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `logs/`, and `tests/gui_runbook_true_device_public_launch.md`.
    - `run.sh` and `run.bat` MUST be start-server or instruction-only for GUI and MUST NOT automate true-device browser actions; the runbook records evidence requirements for human execution.

- [x] 4.3 Add manual evidence collector for WeChat account domains privacy and review settings [#R12]
  - ACCEPT: A structured evidence collector records WeChat account certification/filing/service category status, privacy disclosures, server domains, upload/download/media domains, code upload key/IP whitelist status when applicable, review submission status, and release decision approvals.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.3__ref-R12__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST validate the evidence collector schema/template and fail if required human evidence fields are missing or marked complete without evidence pointers.

## 5. Final Validation And Handoff

- [x] 5.1 Run full source build spec validation gate for launch closure [#R13]
  - ACCEPT: `pnpm typecheck`, `pnpm test`, `pnpm lint`, relevant Admin/Mini Program builds, production artifact scans, and `openspec validate production-public-launch-closure --strict --no-interactive` pass or produce scoped blockers with owners and next actions.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-5.1__ref-R13__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST execute the validation commands, capture logs, and assert that no in-scope command failed silently.

- [x] 5.2 Produce final public launch closure handoff [#R14]
  - ACCEPT: Final handoff summarizes ownership matrix, Codex gates, human evidence, true-device results, Admin auth, CloudBase target, domain/account status, content/media audit, launch decision state, rollback readiness, monitoring plan, and remaining blockers; it references prior production-readiness evidence only as historical or production-like evidence.
  - TEST: SCOPE: CLI
    - Generate validation bundle under `auto_test_openspec/production-public-launch-closure/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-5.2__ref-R14__<YYYYMMDDThhmmssZ>/`.
    - Include `task.md`, `run.sh`, `run.bat`, `inputs/`, `outputs/`, `expected/`, `logs/`, and `tests/`.
    - `run.sh` and `run.bat` MUST validate the handoff structure, exactly one decision state, required evidence links, blocker ownership, and historical evidence classification.
