# Validation Bundle: launch-discover-social-ops / task 4.1 / R8

- change-id: launch-discover-social-ops
- run: RUN #8
- task-id: 4.1
- ref-id: R8
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/launch-discover-social-ops/run-0008__task-4.1__ref-R8__20260708T163117Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-discover-social-ops\run-0008__task-4.1__ref-R8__20260708T163117Z\run.bat
```

## Inputs

No external input files are required. Tests use in-memory CloudBase collection mocks.

## Outputs

- `logs/vitest-cloudbase-social-ops.log`: CloudBase provider parity and API test transcript.

## Expected Results

- `./node_modules/.bin/vitest run apps/api/test/cloudbase.spec.ts apps/api/test/integration-readiness.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` exits with code 0.
- CloudBase provider tests cover discover social interactions, follows/profile routes through shared provider methods, content ops, tag collections, and analytics aggregates.
- Known blocker recorded for production live scope: social notification delivery remains fallback-backed until a dedicated CloudBase notification collection/delivery workflow is verified.

## Provenance

Expected results are derived from task 4.1 ACCEPT criteria. The notification blocker is recorded here for documentation in task 4.2.
