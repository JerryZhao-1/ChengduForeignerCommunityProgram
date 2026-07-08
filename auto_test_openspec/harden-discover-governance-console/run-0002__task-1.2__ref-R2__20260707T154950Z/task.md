# Validation Bundle: R2

change-id: harden-discover-governance-console
run: 0002
task-id: 1.2
ref-id: R2
scope: CLI

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

## Expected Results

The script runs API typecheck and focused integration readiness tests. Expected exit code is 0, including report creation/resolution, content moderation, forbidden access, user enforcement, and audit assertions.

## Provenance

Expected results are derived from task ACCEPT and `apps/api/test/integration-readiness.spec.ts`.
