# Validation Bundle: Task 2.3 / R5

- change-id: `complete-june22-june23-release-readiness`
- run: `0006`
- task-id: `2.3`
- ref-id: `R5`
- scope: `GUI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0006__task-2.3__ref-R5__20260624T000500Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0006__task-2.3__ref-R5__20260624T000500Z\run.bat
```

## Expected results

This task is not complete in this run. The expected result for this attempt is a blocker record because no physical WeChat-capable device verification was available.

Machine-decidable checks:

- `tests/gui_runbook_real_device_places.md` exists.
- `logs/blocker.md` records severity, owner, next repair window, tested package context, and required device evidence.
- `outputs/device-context.txt` records the blocked status.

## GUI runbook

Real-device verification must be executed through:

- `tests/gui_runbook_real_device_places.md`

## Outputs

- `outputs/device-context.txt`: device test context and blocked status.
- `logs/blocker.md`: blocker record for this attempt.

## Provenance

The required flow and evidence fields are derived from task `2.3` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
