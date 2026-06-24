# Validation Bundle: Task 5.1 / R9

- change-id: `complete-june22-june23-release-readiness`
- run: `0010`
- task-id: `5.1`
- ref-id: `R9`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0010__task-5.1__ref-R9__20260624T000900Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0010__task-5.1__ref-R9__20260624T000900Z\run.bat
```

## Expected results

- `openspec validate complete-june22-june23-release-readiness --strict --no-interactive` exits with code `0`.
- Completed tasks have append-only validation bundle evidence.
- Blocked GUI/hosting tasks are documented and remain unchecked.

## Outputs

- `logs/openspec-validate.log`: strict validation output.
- `logs/assertions.log`: evidence and task status assertions.
- `outputs/final-summary.txt`: final status summary.

## Provenance

Expected assertions are derived from task `5.1` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
