# Validation Bundle: Task 4.2 / R8

- change-id: `complete-june22-june23-release-readiness`
- run: `0009`
- task-id: `4.2`
- ref-id: `R8`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0009__task-4.2__ref-R8__20260624T000800Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0009__task-4.2__ref-R8__20260624T000800Z\run.bat
```

## Expected results

- Handoff document lists entry points, data state, validation command results, P0/P1 blockers, owner/next repair windows, and evidence links.
- `docs/plan.md` references the handoff and marks only evidence-backed tasks complete.
- Blocked DevTools import, real-device places verification, and Admin hosting tasks remain unchecked.

## Outputs

- `logs/assertions.log`: assertion transcript.
- `outputs/summary.txt`: pass summary.

## Provenance

Expected assertions are derived from task `4.2` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
