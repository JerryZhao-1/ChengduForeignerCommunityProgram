# Validation Bundle: R7

change-id: harden-discover-governance-console
run: 0007
task-id: 3.1
ref-id: R7
scope: CLI

## How to Run

macOS/Linux: `bash run.sh`
Windows: `run.bat`

## Expected Results

The script runs strict OpenSpec validation, direct shared/API/Admin/Mobile typechecks, and focused shared/API tests. Expected exit code is 0.

## Known Tooling Note

The `pnpm --filter ... typecheck` wrapper may fail before compilation on machines with unapproved dependency builds. This bundle uses local binaries directly to avoid mutating pnpm build approvals.

## Provenance

Expected results are derived from task ACCEPT and the validation commands used during implementation.
