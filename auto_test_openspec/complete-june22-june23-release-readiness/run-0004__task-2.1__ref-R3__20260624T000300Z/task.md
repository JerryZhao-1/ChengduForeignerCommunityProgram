# Validation Bundle: Task 2.1 / R3

- change-id: `complete-june22-june23-release-readiness`
- run: `0004`
- task-id: `2.1`
- ref-id: `R3`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0004__task-2.1__ref-R3__20260624T000300Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0004__task-2.1__ref-R3__20260624T000300Z\run.bat
```

## Expected results

- The build command uses:
  - `VITE_API_MODE=cloudbase-function`
  - `VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`
  - `VITE_CLOUDBASE_FUNCTION_NAME=community-map-api`
- `pnpm --filter @community-map/mobile build:mp-weixin` exits with code `0`.
- `apps/mobile/dist/build/mp-weixin` exists and contains key generated Mini Program files.
- `outputs/import-path.txt` records the absolute WeChat DevTools import path.

## Outputs

- `logs/build.log`: full build output.
- `outputs/import-path.txt`: absolute import path.
- `outputs/generated-files.txt`: top-level generated files.

## Provenance

Expected assertions are derived from task `2.1` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
