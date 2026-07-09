# MCP GUI Runbook: Admin Discover Content Ops

Use Playwright MCP only. Do not use browser automation scripts.

## Prerequisite

Start the API separately in mock mode:

```bash
pnpm dev:api
```

Then run this bundle's `run.sh` or `run.bat` to start Admin.

## Steps

1. Open `http://localhost:5173/posts`.
2. Capture `outputs/screenshots/admin-posts-initial.png`.
3. Assert the posts table includes the `运营` column and post rows render without errors.
4. Open the `运营` tab.
5. Toggle featured/recommended/official controls on the first visible post and set rank to `7`.
6. Refresh the page or click refresh. Assert the same post still shows the saved operations metadata.
7. Fill tag form with ID `coffee-test`, Chinese label `咖啡测试`, English label `Coffee Test`, status `active`, then save.
8. Assert the tag appears in the tag table with a post count and active status.
9. Toggle that tag to hidden, then assert status changes to hidden.
10. Open the `审计` tab, filter target type `标签`, target ID `coffee-test`, and assert an `upsert_tag` audit record is visible.
11. Capture `outputs/screenshots/admin-ops-tags.png`.
12. Record console errors, if any, in `logs/console-admin-ops.txt`.

## Assertion Points

- Content ops controls save through the API and survive refresh.
- Tag taxonomy edits save through the API.
- Audit records include tag operations.
- Non-admin access is covered by CLI API tests.
