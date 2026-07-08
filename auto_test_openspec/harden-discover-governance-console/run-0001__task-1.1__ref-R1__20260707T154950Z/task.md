# Validation Bundle: R1

change-id: harden-discover-governance-console
run: 0001
task-id: 1.1
ref-id: R1
scope: CLI

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

## Expected Results

The script runs shared typecheck plus focused shared contract/client tests. Expected exit code is 0, with Vitest reporting `packages/shared/test/contracts.spec.ts` and `packages/shared/test/client.spec.ts` passed.

## Provenance

Expected results are derived from task ACCEPT and the changed shared schemas/contracts/client surface.
