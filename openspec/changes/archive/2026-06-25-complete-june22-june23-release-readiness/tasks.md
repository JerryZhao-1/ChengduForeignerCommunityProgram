## 1. Validation Blocker Closure

- [x] 1.1 Scope generated CloudBase deployment output out of source lint [#R1]
  - ACCEPT: `apps/api/.cloudbase/` generated deployment output is no longer linted as source code, while normal source files remain covered by ESLint. The chosen approach is documented as generated-output handling rather than a source quality exception.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs `pnpm lint` or a focused lint command proving `.cloudbase` output is ignored and source lint still executes; outputs include lint command, exit code, and a grep/assertion for the ignore configuration.

- [x] 1.2 Run release validation commands after lint blocker closure [#R2]
  - ACCEPT: `pnpm typecheck`, `pnpm test`, and `pnpm lint` all complete with zero exit code after the generated-output lint scope is fixed.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs the three commands, captures stdout/stderr logs, checks exit codes, and summarizes test counts and lint status.

## 2. Mini Program Release Readiness

- [x] 2.1 Build the Mini Program in `cloudbase-function` mode [#R3]
  - ACCEPT: `@community-map/mobile` produces a WeChat Mini Program build using `VITE_API_MODE=cloudbase-function`, `VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`, and `VITE_CLOUDBASE_FUNCTION_NAME=community-map-api`; the generated import path is recorded.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs the real build command, checks exit code, asserts the expected Mini Program output directory exists, records key generated files, and writes the import path to outputs.

- [x] 2.2 Verify WeChat DevTools import and main flow or record a blocker [#R4]
  - ACCEPT: The generated Mini Program package is imported into WeChat DevTools with app id `wx7518a3c1fcdd39a5`; the app launches and main places/events/discover entries are reachable, or an exact DevTools/login/import blocker is recorded without marking the task complete.
  - TEST: SCOPE: GUI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - For GUI scope, run scripts MUST only print/start prerequisites and point to `tests/gui_runbook_wechat_devtools_import.md`; GUI verification is executed through MCP/approved GUI tooling and evidence is stored under outputs/screenshots or logs.
    - Verify: evidence records import path, app id, env id, function name, launch result, reachable main entries, or the exact blocker with severity and next action.

- [x] 2.3 Verify real-device places map navigation and share or record a blocker [#R5]
  - ACCEPT: At least one physical WeChat-capable device verifies places list/map/detail, marker selection, native navigation or acceptable permission fallback, and share behavior; if unavailable, the blocker is graded P0/P1/P2 with owner and next repair window.
  - TEST: SCOPE: GUI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-2.3__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - For GUI scope, run scripts MUST only print/start prerequisites and point to `tests/gui_runbook_real_device_places.md`; real-device evidence is captured through screenshots, notes, or MCP-supported device/DevTools records.
    - Verify: evidence records device type, tested place id, map/navigation/share results, permission prompts, and blocker severity when applicable.

## 3. Admin Hosting And API Readiness

- [x] 3.1 Verify Admin hosting reaches the intended CloudBase dev API domain [#R6]
  - ACCEPT: The Admin hosted dev domain loads the Admin app, calls `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` or a documented equivalent dev API base, and does not use mock/local API for release-readiness validation.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-3.1__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: capture hosted URL reachability, expected API base configuration, and relevant HTTP status summaries.
    - GUI runbook: `tests/gui_runbook_admin_hosting_api.md` captures Admin load, places/admin route behavior, route refresh behavior, and network/API target evidence.

## 4. Data Freeze And Integration Handoff

- [x] 4.1 Clean or classify dev data and freeze release configuration [#R7]
  - ACCEPT: Imported draft places, the published acceptance place, incomplete gallery references, invalid coordinate records, and duplicate/test records are either cleaned or explicitly classified; dev/prod env ids, API domain, function name, Admin hosted domain, app id, storage path, and known production exclusions are documented.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle greps/asserts docs for required environment values, data classification ids/statuses, production exclusions, and any pending cleanup blockers; if data is mutated, outputs include before/after summaries.

- [x] 4.2 Publish the 6.24 integration handoff and update `docs/plan.md` [#R8]
  - ACCEPT: A handoff document or plan section lists API URLs, Admin URL, Mini Program import path, account/actor guidance, data state, validation command results, P0/P1 blockers, owner/next repair window, and links to evidence. `docs/plan.md` checkboxes are updated only for evidence-backed completed tasks.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-4.2__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle checks required handoff sections, blocker classification, evidence links, and plan checkbox wording so blocked tasks are not marked complete.

## 5. Final OpenSpec Gate

- [x] 5.1 Run final OpenSpec validation and record release-readiness evidence [#R9]
  - ACCEPT: `openspec validate complete-june22-june23-release-readiness --strict --no-interactive` passes; all completed tasks have append-only validation bundle evidence; remaining blockers are explicitly documented and not checked off.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-june22-june23-release-readiness/run-<RUN4>__task-5.1__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle runs strict OpenSpec validation, confirms validation bundle paths for completed tasks, and records final blocker/unchecked-task summary.
