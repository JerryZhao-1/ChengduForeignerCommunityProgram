# Mobile singular onboarding and explainable-plan validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0013`
- Task: `14.1`
- Ref: `R14`
- Scope: `MIXED`
- Provenance: replacement worker bundle derived from task 14.1 ACCEPT/TEST.

## How to run

The start scripts only start the H5 service, as required for GUI/MIXED bundles:

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0013__task-14.1__ref-R14__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0013__task-14.1__ref-R14__20260715T082103Z\run.bat`
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

Before starting the service, the Supervisor runs and records these CLI checks separately:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts
```

On Windows, run the same commands in PowerShell or Command Prompt. Save the transcript as `logs/preflight.log`. Then execute the MCP-only instructions in `tests/gui_runbook_onboarding.md`; do not use a browser automation script.

## Inputs and outputs

- Inputs: mock-mode H5, singular preference choices, zh/en locales, and the example profile.
- Outputs: `logs/preflight.log`, `logs/gui-screenshot-index.md`, and MCP screenshots under `outputs/`.

## Expected result

- CLI checks exit `0`.
- Interest and accessibility behave as required single-choice controls, including explicit `none`.
- Local matching displays the localized offline badge.
- The plan shows a localized summary and four ordered explanation reasons at 390px and 1280px.
- Keyboard focus/activation and 44px targets are evidenced.
- The Supervisor records the final PASS/FAIL decision and evidence pointers after completing the runbook.

