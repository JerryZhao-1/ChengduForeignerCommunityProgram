# Validation Bundle: Task 1.1 / R1

- change-id: `complete-june22-june23-release-readiness`
- run: `0002`
- task-id: `1.1`
- ref-id: `R1`
- scope: `CLI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0002__task-1.1__ref-R1__20260624T000100Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0002__task-1.1__ref-R1__20260624T000100Z\run.bat
```

## Expected results

- `eslint.config.mjs` contains the ignore entry `**/.cloudbase/**`.
- `docs/cloudbase-dev-api-deployment.md` documents `.cloudbase` as generated deployment output excluded from source lint.
- `pnpm lint` exits with code `0`, proving normal source lint still runs while generated CloudBase output is ignored.

## Outputs

- `logs/lint.log`: full lint command output.
- `logs/assertions.log`: configuration and documentation assertions.

## Provenance

Expected assertions are derived from task `1.1` ACCEPT criteria in `openspec/changes/complete-june22-june23-release-readiness/tasks.md`.
