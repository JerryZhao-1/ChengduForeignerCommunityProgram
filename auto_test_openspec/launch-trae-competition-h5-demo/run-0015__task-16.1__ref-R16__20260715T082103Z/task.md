# Complete H5 judge-flow validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0015`
- Task: `16.1`
- Ref: `R16`
- Scope: `MIXED`
- Provenance: replacement worker bundle derived from task 16.1 ACCEPT/TEST.

## How to run

The start scripts only start mock-mode H5:

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0015__task-16.1__ref-R16__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0015__task-16.1__ref-R16__20260715T082103Z\run.bat`
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

Before starting, the Supervisor runs the documentation checks below and saves their transcript to `logs/preflight.log`:

```bash
openspec validate launch-trae-competition-h5-demo --strict --no-interactive
rg -n "桐邻 First 120 Minutes|576|离线演示|Demo Confirm" docs/competition
```

Then follow `tests/gui_runbook_complete_flow.md` exclusively through browser MCP operations. Do not create or execute browser automation scripts.

## Inputs and outputs

- Inputs: four profiles listed in the MCP runbook, both locales, mobile/desktop viewports, mock/offline mode, and route degradation states.
- Outputs: `logs/preflight.log`, `logs/gui-screenshot-index.md`, new MCP screenshots under `outputs/`, and recorded elapsed times.

## Expected result

- Four representative profiles render four reasons in both locales.
- Route list remains usable without map/image/detail network enhancement.
- Mock/local mode shows the offline badge.
- One place visit plus one Demo Confirm reaches `1/1` and `1/1` completion in under 180 seconds without registration/ticket requests.
- Reset and refresh safely clear/redirect state.
- The Supervisor records the final PASS/FAIL decision and evidence pointers.

