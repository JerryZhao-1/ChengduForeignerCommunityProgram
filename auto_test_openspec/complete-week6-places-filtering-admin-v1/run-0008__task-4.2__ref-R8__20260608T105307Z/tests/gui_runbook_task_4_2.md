# Admin Gallery Attachment MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Open an existing place in the admin places page.
2. Confirm the gallery manager asks for a file name and has no manual gallery URL textarea.
3. Register a gallery file and confirm the displayed attachment is a file id.
4. Confirm removing an attached file updates the displayed gallery_file_ids list.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
