# R18 independent CloudBase deployment and public acceptance run 0042

- Change: `launch-trae-competition-h5-demo`
- Run: `0042`
- Task / Ref: `18.1` / `R18`
- Scope: MIXED (CLI preparation plus MCP-only external GUI acceptance)
- Commit: `775ede097bc3c65cd1772749cbc5d2f228e3fd35`
- CloudBase environment: `cloud1-d7gxdk8t43bd639c0`
- Target application: `trae-h5-demo`
- Production API: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Final decision: `NOT COMPLETE` (platform isolation and offline interception gates failed)

## Authority and safety boundary

This run updates only the code of the already-authorized `community-map-api` function and creates an independent CloudBase Web App. It does not update function configuration, secrets, permissions, gateway settings, or existing Admin Static Hosting content. First-deploy rollback is deletion of `trae-h5-demo`; this is documented only and is not executed during a successful run.

## Evidence layout

- `logs/`: redacted command, platform, build, browser, and Supervisor records.
- `outputs/`: public responses, fingerprints, pre/post Admin hashes, deployment metadata, and screenshot index.
- `outputs/screenshots/`: MCP-only product captures; no scripted browser harness.
- `tests/gui-runbook.md`: exact external acceptance instructions.
- `run.sh` / `run.bat`: cross-platform evidence entrypoints; they only print the already-deployed public target and never automate a browser.

No TRAE Session ID or screenshot is inferred by this run. R18 remains open. The build briefly served the intended H5, but CloudBase published it into the shared Hosting root; the original Admin entry was therefore restored byte-for-byte and the H5 domain no longer serves the competition entry.
