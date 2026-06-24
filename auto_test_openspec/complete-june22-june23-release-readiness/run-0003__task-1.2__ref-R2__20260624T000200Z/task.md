# Validation Bundle: Task 1.2 / R2

- change-id: `complete-june22-june23-release-readiness`
- run: `0003`
- task-id: `1.2`
- ref-id: `R2`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0003__task-1.2__ref-R2__20260624T000200Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0003__task-1.2__ref-R2__20260624T000200Z\run.bat
```

## Expected results

- `pnpm typecheck` exits with code `0`.
- `pnpm test` exits with code `0`.
- `pnpm lint` exits with code `0`.

## Outputs

- `logs/typecheck.log`: full typecheck output.
- `logs/test.log`: full test output and test summary.
- `logs/lint.log`: full lint output.
- `outputs/summary.txt`: command exit code summary.

## Provenance

Expected assertions are derived from task `1.2` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
