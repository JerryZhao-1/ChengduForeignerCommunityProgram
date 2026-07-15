# Community Plan singular contract lock — final corrected retry (R11)

- Change: `launch-trae-competition-h5-demo`
- Run: `0031`
- Task / Ref: `11.1` / `R11`
- Scope: `CLI`
- Baseline HEAD: `e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`
- Corrects: run-0027 hard-coded evidence; run-0029 failed closed because its bundle-local spec was excluded by the repository Vitest globs.

## Run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0031__task-11.1__ref-R11__20260715T123246Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0031__task-11.1__ref-R11__20260715T123246Z\run.bat`

The verifier runs shared typecheck, lint, and focused tests. PASS requires every listed R11 assertion to be present with status `passed`, zero failed tests, and an exact comparison of computed checks with `expected/result.json`.

Outputs are `logs/run.log`, `logs/vitest.json`, and `outputs/result.json`. This CLI run does not validate R15, GUI behavior, deployment, R18, or TRAE Session provenance.
