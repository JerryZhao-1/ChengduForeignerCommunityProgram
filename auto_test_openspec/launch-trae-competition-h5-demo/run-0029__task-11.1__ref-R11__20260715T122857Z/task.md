# Community Plan singular contract lock review — corrected retry (R11)

- Change: `launch-trae-competition-h5-demo`
- Run: `0029`
- Task: `11.1`
- Ref: `R11`
- Scope: `CLI`
- Branch: `competition/trae-h5-demo`
- Baseline HEAD: `e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`
- Corrects: run-0027 hard-coded contract claims without checking named assertions or `expected/result.json`.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0029__task-11.1__ref-R11__20260715T122857Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0029__task-11.1__ref-R11__20260715T122857Z\run.bat`

The scripts resolve the repository from their own location. They run shared typecheck, lint, the focused shared suites, and this bundle's evidence-specific assertions. The verifier requires every named R11 assertion to exist and pass, compares computed checks with `expected/result.json`, and includes both gates in its exit decision.

## Inputs and outputs

- Input: the current worktree, shared Community Plan schemas/contracts/client, focused tests, `tests/evidence-assertions.spec.ts`, and `expected/result.json`.
- Output: `logs/run.log`, `logs/vitest.json`, and `outputs/result.json`.
- PASS requires typecheck/lint/Vitest exit `0`, zero failed tests, all required named assertions present and passed, and an exact match between computed checks and `expected/result.json`.

## Boundary

This CLI retry corrects only R11 evidence integrity. It does not validate R15, GUI behavior, deployment, R18, or TRAE Session provenance.
