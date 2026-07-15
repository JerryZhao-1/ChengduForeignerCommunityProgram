# Mobile singular onboarding and explainable-plan validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0026`
- Task: `14.1`
- Ref: `R14`
- Scope: `MIXED`
- Provenance: worker bundle prepared after the catalog-eyebrow fix; supersedes run-0013 content without editing it. Codex Supervisor executed the CLI and GUI runbook on 2026-07-15 and recorded the verdict in `logs/supervisor-verdict.md`.

## How to run

The start scripts only start the H5 service with `VITE_API_MODE=mock`, as required for GUI/MIXED bundles:

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0026__task-14.1__ref-R14__20260715T113723Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0026__task-14.1__ref-R14__20260715T113723Z\run.bat`
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

Before starting the service, the Supervisor runs and records these CLI checks separately:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts
```

On Windows, run the same commands in PowerShell or Command Prompt. Save the transcript as `logs/preflight.log`. Then execute the MCP-only instructions in `tests/gui_runbook_onboarding.md`; do not use a browser automation script.

## Test inputs and outputs

- Inputs: mock-mode H5, singular preference choices, zh/en locales, and the example profile.
- Outputs: `logs/preflight.log`, `logs/gui-screenshot-index.md`, `logs/supervisor-verdict.md`, and browser screenshots under `outputs/`.

## Expected result

- CLI checks exit `0`.
- Interest and accessibility behave as required single-choice controls, including explicit `none` ("无额外需求 / No additional need"); a later choice replaces the earlier one.
- Generating state shows transparent copy: check time, match places, organize tips, prepare route.
- The plan shows a "为什么这样匹配" / "Why this was matched" section, a bilingual summary, and exactly four ordered reason labels: primary interest, arrival stage, household, participation guidance. No AI/model/generated_by/provider status is rendered.
- Local matching displays the localized offline badge ("离线演示 · 使用同版本本地社区目录" / "Offline demo · Using the same-version local community catalog").
- No raw enum values appear; all system copy resolves from the central zh/en catalog (including the brand eyebrow).
- 390px and 1280px both remain usable; interactive targets are at least 44px with visible focus.
- The Mini Program shows only the localized H5-only boundary and exposes no competition entry.
- The Supervisor records the final PASS/FAIL decision and evidence pointers after completing the runbook.

## Supervisor result

`PASS` — see `logs/supervisor-verdict.md` for the final decision and `logs/gui-screenshot-index.md` for viewport, interaction, and screenshot evidence.

## Provenance of expected

Expected behavior is derived from the task 14.1 ACCEPT block and the `mobile-language-experience` / `trae-competition-h5-experience` specs. CLI assertions are exit-code based; GUI assertions are screenshot/state based per the MCP runbook.
