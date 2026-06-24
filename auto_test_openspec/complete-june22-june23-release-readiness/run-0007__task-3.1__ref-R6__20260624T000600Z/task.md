# Validation Bundle: Task 3.1 / R6

- change-id: `complete-june22-june23-release-readiness`
- run: `0007`
- task-id: `3.1`
- ref-id: `R6`
- scope: `MIXED`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0007__task-3.1__ref-R6__20260624T000600Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0007__task-3.1__ref-R6__20260624T000600Z\run.bat
```

## Expected results

This task is not complete in this run. The expected result for this attempt is a blocker record because the Admin hosted domain does not currently serve the Admin app.

Observed CLI evidence:

- Hosted Admin root returned HTTP `404` / `NoSuchKey` for `index.html`.
- Hosted Admin `/places` returned HTTP `404` / `NoSuchKey` for `places`.
- CloudBase dev API `/api/health` returned HTTP `200` with `{"ok":true}`.

Machine-decidable checks:

- `tests/gui_runbook_admin_hosting_api.md` exists.
- `logs/observed-http.md` records hosted URL, API URL, HTTP status summaries, and blocker.
- `outputs/admin-hosting-context.txt` records blocked status.

## GUI runbook

GUI verification must be executed through:

- `tests/gui_runbook_admin_hosting_api.md`

## Outputs

- `outputs/admin-hosting-context.txt`: hosted/API context and blocked status.
- `logs/observed-http.md`: HTTP observation summary for this attempt.

## Provenance

Observed HTTP statuses were captured on 2026-06-24 with `curl` against the documented CloudBase dev hosting and API domains.
