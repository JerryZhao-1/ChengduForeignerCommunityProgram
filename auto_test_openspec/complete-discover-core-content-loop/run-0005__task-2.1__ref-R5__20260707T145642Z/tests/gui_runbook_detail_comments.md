# MCP GUI Runbook: Detail Comments

Use playwright-mcp only; do not use browser automation scripts.

1. Start API and Mobile H5 in HTTP mode from the repository root.
2. Open `/pages/discover/detail?id=post_001`.
3. Capture screenshot evidence that the comments section is populated from API data.
4. Submit a comment, then capture evidence that the list refreshes and the comment count changes.
5. Reload the detail page and capture evidence that the submitted comment remains visible.
6. Open `/pages/discover/detail?id=post_hidden` and capture the error/not-found state.
