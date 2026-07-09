# Task 3.1 - Places Detail Share Behavior

Change: `production-readiness-acceptance`

Reference: `#R4`

Scope: Mixed

This bundle covers the Places detail share behavior after the implementation change:

- WeChat Mini Program builds expose a native `open-type="share"` button.
- Places detail registers `onShareAppMessage` and `onShareTimeline`.
- The Mini Program compiled Places detail page does not bind the share button to clipboard copying.
- Non-Mini Program fallback is explicitly labelled as copy-link behavior.

## CLI Assertions Already Available

Run these commands from the repository root:

```bash
corepack pnpm --filter @community-map/mobile typecheck
VITE_API_MODE=cloudbase-function VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api corepack pnpm --filter @community-map/mobile build:mp-weixin
node auto_test_openspec/production-readiness-acceptance/run-0004__task-3.1__ref-R4__20260709T080744Z/tests/test_cli_places_share_static.mjs
```

The static check writes `outputs/static-share-check.json`.

## GUI Runbook

Use `tests/gui_runbook_places_share.md`. GUI evidence must be collected through WeChat DevTools or a true Mini Program device and saved under this run folder's `outputs/`.

