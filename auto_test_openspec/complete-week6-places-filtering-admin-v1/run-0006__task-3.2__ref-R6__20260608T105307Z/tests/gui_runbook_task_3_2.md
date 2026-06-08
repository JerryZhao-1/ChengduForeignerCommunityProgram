# Mobile Recommended Entry MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Open the home places recommended entry or /pages/places/recommended shim.
2. Confirm navigation lands on /pages/places/index with recommended=true and sort=recommended.
3. Confirm list results show recommended-only places.
4. Open a recommended place card and confirm detail navigation still works.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
