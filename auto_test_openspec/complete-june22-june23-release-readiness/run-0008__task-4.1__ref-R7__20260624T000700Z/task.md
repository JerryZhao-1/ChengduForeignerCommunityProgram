# Validation Bundle: Task 4.1 / R7

- change-id: `complete-june22-june23-release-readiness`
- run: `0008`
- task-id: `4.1`
- ref-id: `R7`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0008__task-4.1__ref-R7__20260624T000700Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0008__task-4.1__ref-R7__20260624T000700Z\run.bat
```

## Expected results

- Handoff docs include dev/prod configuration values and production exclusions.
- Handoff docs classify imported drafts, published acceptance place, incomplete gallery references, invalid/missing coordinates, duplicate/test records, and pending cleanup blockers.
- No production data mutation is claimed.

## Outputs

- `logs/assertions.log`: assertion transcript.
- `outputs/summary.txt`: pass summary.

## Provenance

Expected assertions are derived from task `4.1` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
