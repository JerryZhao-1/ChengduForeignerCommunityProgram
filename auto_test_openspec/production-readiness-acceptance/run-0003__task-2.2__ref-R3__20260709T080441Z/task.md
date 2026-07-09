# Task 2.2 - Replace Or Classify Mock Actor Usage For Production Acceptance

Change: `production-readiness-acceptance`

Reference: `#R3`

Scope: CLI

This bundle validates that production-readiness evidence no longer treats `x-mock-user-id` as an implicit production identity mechanism. The current CloudBase target remains classified as a production-like dev acceptance target. Admin and member actor headers are accepted only because they are declared in `inputs/target.json` and documented in `docs/production-acceptance-identity.md`.

## What This Bundle Checks

- Identity classification document exists.
- The document separates local mock, CloudBase dev acceptance, and public production identity.
- The API guide links to the identity classification document.
- The target config explicitly declares admin/member dev actors and classifies `x-mock-user-id`.
- CloudBase role checks verify that `user_001` can access admin APIs and `user_002` receives `403`.
- If no-header admin access succeeds because of fallback behavior, the result is recorded as a public-launch blocker rather than accepted as production auth.

## Run

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Outputs are written to `outputs/`; command logs are written to `logs/`.
