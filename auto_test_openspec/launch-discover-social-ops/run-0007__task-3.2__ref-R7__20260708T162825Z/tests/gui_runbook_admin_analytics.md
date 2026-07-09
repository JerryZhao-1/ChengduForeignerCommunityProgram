# MCP GUI Runbook: Admin Discover Analytics

Use Playwright MCP only. Do not use browser automation scripts.

## Prerequisite

Start the API separately in mock mode:

```bash
pnpm dev:api
```

Then run this bundle's `run.sh` or `run.bat` to start Admin.

## Steps

1. Open `http://localhost:5173/posts`.
2. Open the `分析` tab.
3. Assert cards for content volume, pending workload, engagement, active authors, popular places, and popular events are visible.
4. Change the window days input to `90`, click refresh, and assert the cards update without errors.
5. Capture `outputs/screenshots/admin-analytics.png`.
6. Record console errors, if any, in `logs/console-admin-analytics.txt`.

## Assertion Points

- Metrics render from `/admin/discover/analytics`.
- Empty arrays render gracefully when the selected window has no records.
- No uncaught console error is emitted during the dashboard flow.
