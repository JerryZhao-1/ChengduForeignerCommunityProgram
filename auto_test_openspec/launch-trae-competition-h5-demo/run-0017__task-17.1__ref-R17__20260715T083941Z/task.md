# AI-free local release-gate validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0017`
- Task: `17.1`
- Ref: `R17`
- Scope: `CLI`
- Provenance: new immutable verification run derived from task 17.1 ACCEPT/TEST after the 21-module specification clarification.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0017__task-17.1__ref-R17__20260715T083941Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0017__task-17.1__ref-R17__20260715T083941Z\run.bat`

## Inputs and outputs

- Input: current repository worktree, active OpenSpec change, all tests, and both mobile build targets.
- Output: `logs/run.log`, `outputs/checks.json`, generated H5/mp-weixin build artifacts, and a separately recorded Supervisor verdict.
- Expected: 21/21 dimension modules, 576/576 logical profiles, 1,152/1,152 localized cases, 576/576 provider/local parity, and zero reason/module mismatches.

## Machine-decidable result

- Root typecheck, tests, lint, both mobile builds, focused feedback-correspondence tests, formatting, and strict OpenSpec validation exit `0`.
- H5 and mp-weixin expected entry artifacts exist.
- Runtime source and H5 artifacts contain none of the forbidden Community Plan model-call/result markers.
- `outputs/checks.json` is written only after every worker check completes and keeps `finalDecision` pending until a Supervisor records the verdict.

## Evidence boundary

This CLI run is Codex/local verification, not a TRAE Session ID, TRAE screenshot, public deployment, or external GUI acceptance result. It does not complete R18.
