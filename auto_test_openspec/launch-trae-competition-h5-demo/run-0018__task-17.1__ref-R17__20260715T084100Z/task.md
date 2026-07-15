# AI-free local release-gate validation retry

- Change: `launch-trae-competition-h5-demo`
- Run: `0018`
- Task: `17.1`
- Ref: `R17`
- Scope: `CLI`
- Provenance: append-only retry of failed run 0017 with the formatting assertion corrected to cover only files changed by this specification clarification.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0018__task-17.1__ref-R17__20260715T084100Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0018__task-17.1__ref-R17__20260715T084100Z\run.bat`

## Inputs, outputs, and expected result

- Input: current worktree, active OpenSpec change, all tests, both mobile targets, and the files changed by the 21-module clarification.
- Output: `logs/run.log`, `outputs/checks.json`, generated H5/mp-weixin artifacts, and `supervisor-verdict.md` after execution.
- Expected: all commands exit `0`; 21/21 modules, 576/576 scenarios, 576 unique keys, 1,152/1,152 localized cases, 576/576 parity, zero reason/module mismatches, zero forbidden model-runtime markers, and both target entry artifacts present.

This is Codex/local CLI verification, not a TRAE Session, public deployment, or external GUI acceptance result. It does not complete R18.
