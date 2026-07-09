# Task 3.3 - Mini Program Tab And Platform Capability Acceptance

Change: `production-readiness-acceptance`

Reference: `#R6`

Scope: GUI

Canonical WeChat DevTools import path:

`apps/mobile/dist/build/mp-weixin`

This bundle validates that the generated Mini Program project has all required tabs and CloudBase function configuration. Final acceptance requires DevTools or true-device evidence captured through the runbook.

## CLI Checks

Run from the repository root:

```bash
VITE_API_MODE=cloudbase-function VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api corepack pnpm --filter @community-map/mobile build:mp-weixin
node auto_test_openspec/production-readiness-acceptance/run-0006__task-3.3__ref-R6__20260709T081119Z/tests/test_cli_mini_program_tabs_static.mjs
```

## GUI Runbook

Use `tests/gui_runbook_mini_program_tabs.md`.

Evidence must be saved under this run folder's `outputs/`.

