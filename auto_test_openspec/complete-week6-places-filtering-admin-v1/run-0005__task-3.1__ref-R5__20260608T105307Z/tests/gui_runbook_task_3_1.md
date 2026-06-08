# Mobile Places Filters MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Open the places list page.
2. Confirm keyword search refreshes list results without leaving the list page.
3. Change category and confirm the request/query uses a value from PLACE_TOP_LEVEL_CATEGORIES.
4. Tap a place card tag and confirm the list reloads with the selected tag visible as an active filter.
5. Clear filters and confirm category, tag, keyword, and recommended state reset.
6. Open a place card and confirm navigation reaches the detail page for that place id.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
