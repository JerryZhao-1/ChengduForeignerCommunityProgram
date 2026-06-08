# Final Week 6 GUI Sweep MCP GUI Runbook

Use the Codex Browser / Playwright MCP only. Do not add executable browser automation scripts to this bundle.

## Preconditions

- Execute any CLI preflight commands listed in task.md and record output paths in the evidence log.
- Start the local service with this run folder's run.sh or run.bat.
- Use the URL printed by the script.

## MCP Assertions

1. Run the mobile places filter assertions from task 3.1.
2. Run the mobile recommended entry assertions from task 3.2.
3. Run the mobile gallery detail assertions from task 4.3.
4. Start the admin dev server separately if needed and run the admin metadata/gallery assertions from tasks 4.1 and 4.2.
5. Record any blocker with exact command, file, and error output.

## Evidence To Record

- Browser URL for each checked state.
- Screenshot paths for the starting state and final asserted state.
- Console/network errors if present.
