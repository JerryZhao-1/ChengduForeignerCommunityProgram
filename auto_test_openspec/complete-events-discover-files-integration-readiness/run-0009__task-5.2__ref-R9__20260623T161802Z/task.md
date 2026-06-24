change-id: complete-events-discover-files-integration-readiness
run: 0009
task-id: 5.2
ref-id: R9
scope: CLI

How to run:
- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Checks:
- Greps sprint and deployment docs for readiness status, evidence paths, and non-places CloudBase live-provider limitations.

Expected result:
- All grep assertions exit 0.
- Logs are written under `logs/`.
