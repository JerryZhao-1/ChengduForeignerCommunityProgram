# Admin Places Metadata MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Open the admin places page in mock mode.
2. Confirm form fields exist for bilingual names/intros, categories, tags, status, coordinates, Tencent POI, recommendation state/reasons/rank, and navigation/favorite/share flags.
3. Create a draft place and confirm it appears in the admin table.
4. Edit the draft to published with recommendation metadata and confirm the table reflects the update.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
