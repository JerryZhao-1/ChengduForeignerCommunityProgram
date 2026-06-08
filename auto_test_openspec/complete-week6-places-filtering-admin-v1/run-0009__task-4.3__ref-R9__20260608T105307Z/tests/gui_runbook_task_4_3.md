# Mobile Gallery Media Detail MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Open a published place detail that has gallery_media entries.
2. Confirm gallery images render as image elements.
3. Confirm raw gallery file ids, cloud paths, and URL strings are not displayed as body text.
4. Confirm the detail still shows address, hours, intro, category, tags, and navigation action.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
