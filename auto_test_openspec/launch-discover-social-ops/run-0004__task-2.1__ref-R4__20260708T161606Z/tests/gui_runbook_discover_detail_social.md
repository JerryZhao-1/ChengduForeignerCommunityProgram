# MCP GUI Runbook: Discover Detail Social Interactions

Use Playwright MCP only. Do not use browser automation scripts.

## Prerequisite

Start the API separately in mock mode:

```bash
pnpm dev:api
```

Then run this bundle's `run.sh` or `run.bat` to start Mobile H5.

## Steps

1. Open `http://localhost:5174/#/pages/discover/detail?id=post_001`.
2. Capture a screenshot as `outputs/screenshots/detail-initial.png`.
3. Record visible like, favorite, and share counts from the bottom action bar.
4. Click the post like action. Assert the liked visual state is active and the like count increases by 1.
5. Reload the page. Assert the liked visual state remains active and the like count matches the post-interaction API state.
6. Click the favorite action. Assert the favorite visual state is active and the favorite count increases by 1.
7. Reload the page. Assert favorite state and count persist.
8. Open the share sheet. Click copy-link. Assert the share count increases by 1 and the sheet closes.
9. Capture a screenshot as `outputs/screenshots/detail-after-social.png`.
10. Record console errors, if any, in `logs/console-social.txt`.

## Assertion Points

- Detail content remains visible throughout the flow.
- Like/favorite/share counters do not reset after reload.
- No hidden/deleted post data appears.
- No uncaught console error is emitted during interactions.
