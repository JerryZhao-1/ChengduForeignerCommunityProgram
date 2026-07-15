# Community Plan online/offline parity — final corrected retry (R15)

- Change: `launch-trae-competition-h5-demo`
- Run: `0032`
- Task / Ref: `15.1` / `R15`
- Scope: `CLI`
- Baseline HEAD: `e15efde43ad0eb3c3c6317ee32a6c7309fd2d110`
- Corrects: run-0028 hard-coded evidence; run-0030 was superseded before execution after its bundle-local spec was found outside repository Vitest globs.

## Run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0032__task-15.1__ref-R15__20260715T123247Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0032__task-15.1__ref-R15__20260715T123247Z\run.bat`

The verifier runs mobile typecheck, lint, and focused adapter/store/shared suites. PASS requires every named parity, 4xx, fallback, offline-session, and bundle-safety assertion to exist and pass. Computed result and parity summaries must exactly match both JSON files under `expected/`.

The maintained shared safety test recursively scans the serialized offline catalog for credential/config keys and CloudBase/local/API backend patterns, and proves that strict plan parsing rejects `deliveryMode`. Outputs are `logs/run.log`, `logs/vitest.json`, `outputs/result.json`, and `outputs/parity-summary.json`.

This CLI run does not validate GUI behavior, public deployment, R18, or TRAE Session provenance.
