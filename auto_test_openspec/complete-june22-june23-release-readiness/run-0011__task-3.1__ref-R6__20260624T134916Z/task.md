# Validation Bundle: Task 3.1 / R6

- change-id: `complete-june22-june23-release-readiness`
- run: `0011`
- task-id: `3.1`
- ref-id: `R6`
- scope: `MIXED`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0011__task-3.1__ref-R6__20260624T134916Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0011__task-3.1__ref-R6__20260624T134916Z\run.bat
```

## Expected results

- Hosted Admin root returns HTTP 200 and serves `Community Map Admin`.
- Hosted Admin `/places` direct route returns HTTP 200 and serves the Admin app through SPA fallback.
- CloudBase dev API `/api/health` returns HTTP 200 and `{"ok":true}`.
- Built Admin JS contains `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` and does not contain `127.0.0.1:8787`.
- GUI/MIXED evidence records that the hosted Admin bundle was deployed to the existing CloudBase shared hosting domain.

## Outputs

- `logs/root.headers`, `logs/root.html`
- `logs/places.headers`, `logs/places.html`
- `logs/api-health.headers`, `logs/api-health.json`
- `logs/assertions.log`
- `outputs/summary.txt`

## Provenance

Expected assertions are derived from task `3.1` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`. The Admin bundle was built with `VITE_API_MODE=http` and `VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`, uploaded to CloudBase hosting, and configured with `index.html` 404 fallback on 2026-06-24.
