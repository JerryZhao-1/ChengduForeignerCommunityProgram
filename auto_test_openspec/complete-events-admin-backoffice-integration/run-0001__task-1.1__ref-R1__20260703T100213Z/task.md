# Validation Bundle: Task 1.1

- change-id: `complete-events-admin-backoffice-integration`
- run: `RUN #1`
- task-id: `1.1`
- ref-id: `R1`
- scope: `CLI`

## How To Run

macOS/Linux:

```bash
bash run.sh
```

Windows:

```bat
run.bat
```

## Expected Results

The bundle runs shared typecheck and focused shared Vitest coverage for event admin paths, schemas, mock/http client signatures, and mock service fixtures. It writes command logs to `logs/`. Expected result is exit code `0` for every command and logs containing the invoked shared checks.

## Provenance

Assertions are derived from the task ACCEPT block and the OpenSpec spec for admin event list and registration inspection. No external input files are required.
