# Validation Bundle: Task 2.2 / R4

- change-id: `complete-june22-june23-release-readiness`
- run: `0005`
- task-id: `2.2`
- ref-id: `R4`
- scope: `GUI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0005__task-2.2__ref-R4__20260624T000400Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0005__task-2.2__ref-R4__20260624T000400Z\run.bat
```

## Expected results

This task is not complete in this run. The expected result for this attempt is a blocker record because WeChat DevTools import and main-flow launch were not verified.

Machine-decidable checks:

- `tests/gui_runbook_wechat_devtools_import.md` exists.
- `logs/blocker.md` records the import blocker severity, prerequisite, and next action.
- `outputs/import-context.txt` records the generated package path, app id, env id, and function name.

## GUI runbook

GUI verification must be executed through the MCP-only runbook:

- `tests/gui_runbook_wechat_devtools_import.md`

## Outputs

- `outputs/import-context.txt`: package/import context.
- `logs/blocker.md`: blocker record for this attempt.

## Provenance

The package path comes from task `2.1` build output. The blocker comes from the 2026-06-24 DevTools CLI check, which reported the IDE service port disabled and required a security-setting confirmation before CLI calls can proceed.
