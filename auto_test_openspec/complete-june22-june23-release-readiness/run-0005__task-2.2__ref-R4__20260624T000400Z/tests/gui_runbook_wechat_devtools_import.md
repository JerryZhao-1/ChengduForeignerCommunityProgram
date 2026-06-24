# GUI Runbook: WeChat DevTools Import

Use MCP-approved GUI tooling only. Do not run browser automation scripts.

## Context

- Import path: `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- App id: `wx7518a3c1fcdd39a5`
- CloudBase env id: `cloud1-d7gxdk8t43bd639c0`
- CloudBase function name: `community-map-api`
- API mode: `cloudbase-function`

## Verification steps

1. Open WeChat DevTools.
2. Ensure the operator is logged in with access to app id `wx7518a3c1fcdd39a5`.
3. Import the package at the import path above.
4. Launch the Mini Program simulator.
5. Capture evidence that the app does not render a blank screen.
6. Navigate to the main places, events, and discover entries.
7. Capture screenshots or structured notes for each reachable entry.
8. Store GUI evidence under this run folder in `outputs/screenshots/` or `logs/`.

## Current blocker

This run did not execute the GUI flow. The DevTools CLI check reported that the IDE service port is disabled and prompted for a security-setting confirmation. The setting was not changed in this run, so import/main-flow evidence is blocked.
