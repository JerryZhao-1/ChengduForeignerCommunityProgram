# Validation Bundle: R3

change-id: harden-discover-governance-console
run: 0003
task-id: 1.3
ref-id: R3
scope: CLI

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

## Expected Results

The script runs API typecheck and the focused API readiness test. Expected exit code is 0. The test validates private `report_evidence` upload/complete, admin report evidence temporary access, public non-leakage, and non-admin forbidden queue access.

## Provenance

Expected results are derived from task ACCEPT and the file/report assertions in `apps/api/test/integration-readiness.spec.ts`.
