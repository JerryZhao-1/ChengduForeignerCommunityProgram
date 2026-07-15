# Supervisor GUI verification retry

- Change: `launch-trae-competition-h5-demo`
- Run: `0036`
- Task: `16.1`
- Ref: `R16`
- Scope: `MIXED`
- Provenance: append-only GUI retry after run-0033 and run-0034 remained GUI-pending. Run-0034 is preserved unchanged. This run isolates GUI evidence from the corrected R17 CLI run-0035.

## How to run

The one-click scripts are start-server-only, as required for GUI/MIXED bundles:

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0036__task-16.1__ref-R16__20260715T133643Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0036__task-16.1__ref-R16__20260715T133643Z\run.bat`
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

Before starting the service, the Supervisor may run the exact CLI preflight below and record it in `logs/preflight.log`; the launcher itself does not run tests or mutate evidence:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts
pnpm --filter @community-map/mobile build:h5
pnpm --filter @community-map/mobile build:mp-weixin
```

## Inputs and outputs

- Inputs: mock-mode H5; four representative profiles; zh/en locales; 390px mobile and 1280px desktop viewports.
- Outputs: product screenshots under `outputs/`, `logs/gui-screenshot-index.md`, `logs/console-observations.md`, and `logs/supervisor-verdict.md`.
- GUI execution: follow the Computer Use/MCP-only runbook in `tests/gui_runbook_release_gate.md`. Do not add or run Playwright, Selenium, or browser scripts.

## Expected result

- Eight profile/locale flows reach plan, route-map, and complete within 180 seconds.
- Mobile pages have no horizontal overflow; desktop layout remains centered and usable.
- No browser console errors, raw enum leakage, or AI/model-generated wording is observed.
- Locale switching preserves the plan and scenario key.
- Route-map renders place then event; completion remains locked until both actions are recorded.

## Immutability boundary

This run folder is the new Supervisor attempt. After screenshots, indexes, and verdict are written, it becomes immutable. Any retry after a failed or incomplete execution must use a new run number.
