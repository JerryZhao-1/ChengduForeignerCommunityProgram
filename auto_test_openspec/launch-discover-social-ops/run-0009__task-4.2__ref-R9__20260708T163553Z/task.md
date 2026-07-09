# Validation Bundle: launch-discover-social-ops / task 4.2 / R9

- change-id: launch-discover-social-ops
- run: RUN #9
- task-id: 4.2
- ref-id: R9
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/launch-discover-social-ops/run-0009__task-4.2__ref-R9__20260708T163553Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-discover-social-ops\run-0009__task-4.2__ref-R9__20260708T163553Z\run.bat
```

## Inputs

No external input files are required.

## Outputs

- `logs/final-docs-validation.log`: strict OpenSpec validation, root test run, and Admin/Mobile typecheck transcript.

## Expected Results

- `openspec validate launch-discover-social-ops --strict --no-interactive` reports `Change 'launch-discover-social-ops' is valid`; in this environment the follow-up OpenSpec workspace dependency check may be blocked by pnpm ignored-build approval.
- `pnpm test` may be blocked before Vitest starts by the same pnpm ignored-build approval check.
- Direct fallback Vitest exits with code 0 for `packages/shared/test/contracts.spec.ts`, `packages/shared/test/client.spec.ts`, `apps/api/test/integration-readiness.spec.ts`, and `apps/api/test/cloudbase.spec.ts`.
- Admin and Mobile `vue-tsc --noEmit -p tsconfig.json` checks exit with code 0.
- Additional direct API and shared `tsc --noEmit -p tsconfig.json` checks exit with code 0.
- Docs describe the new Discover social state, public profiles, follow state, content ops, tags, analytics, CloudBase provider coverage, and the remaining social notification live-delivery boundary.

## Provenance

Expected results are derived from task 4.2 ACCEPT and TEST criteria.
