# GUI Runbook: Admin Hosting To Dev API

Use MCP-approved GUI tooling only. Do not run browser automation scripts.

## Context

- Hosted Admin URL: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`
- Hosted Admin places route: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/places`
- Intended API base: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin expected HTTP mode env:
  - `VITE_API_MODE=http`
  - `VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

## Verification steps after redeploy/fallback fix

1. Open the hosted Admin root URL.
2. Verify the Admin app renders without a blank screen or hosting 404.
3. Open or refresh the places route URL directly.
4. Verify the route renders the Admin app rather than a hosting 404.
5. Capture network evidence that API requests target the intended API base, not mock or localhost.
6. Record the actor used for protected admin checks.
7. Store screenshots, network summaries, or structured notes under this run folder in `outputs/screenshots/` or `logs/`.

## Current blocker

This run did not execute the GUI flow because the hosted domain returned `404 NoSuchKey` before the Admin app could load.
