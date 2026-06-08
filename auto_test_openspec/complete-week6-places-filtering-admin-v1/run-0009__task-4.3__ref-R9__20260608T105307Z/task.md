# Validation Bundle: Verify attached gallery files resolve to mobile-displayable detail media

- change-id: complete-week6-places-filtering-admin-v1
- run: 9
- task-id: 4.3
- ref-id: R9
- scope: MIXED

## How To Run

macOS/Linux:

```bash
auto_test_openspec/complete-week6-places-filtering-admin-v1/run-0009__task-4.3__ref-R9__20260608T105307Z/run.sh
```

Windows:

```bat
auto_test_openspec/complete-week6-places-filtering-admin-v1/run-0009__task-4.3__ref-R9__20260608T105307Z/run.bat
```

## CLI Preflight Commands

For this MIXED bundle, record these command outputs before starting GUI validation:

- `corepack pnpm vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts`
- `corepack pnpm --filter @community-map/mobile typecheck`

## Inputs

No external input files are required. Inputs are the repository code, mock dataset, shared schemas, and route/query parameters described in the task acceptance criteria.

## Outputs

- CLI logs: `logs/run.log` when this bundle runs CLI checks.
- GUI service logs: `logs/dev-server.log` for GUI/MIXED bundles.
- GUI evidence: screenshot paths, URL states, and console/network notes recorded by the Supervisor under `logs/`.

## Expected Results

- Scripts exit with code 0 for CLI checks or keep the local dev server running for GUI/MIXED validation.
- Query names and route paths match the shared contract and API implementation.
- List and marker payloads do not include detail-only media/navigation fields.
- GUI assertions, when applicable, are executed only through MCP according to the runbook in `tests/`.

## Provenance

Expected behavior is derived from `openspec/changes/complete-week6-places-filtering-admin-v1/tasks.md`, the spec deltas, and the implemented repository contracts/tests.
