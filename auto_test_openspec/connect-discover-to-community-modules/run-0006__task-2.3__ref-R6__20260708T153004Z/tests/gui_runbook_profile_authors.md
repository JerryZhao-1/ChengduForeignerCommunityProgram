# MCP GUI runbook

1. Open `http://localhost:5174/#/pages/discover/detail?id=post_001`.
2. Verify the post author uses the API nickname/avatar and opens `/pages/more/profile?id=user_001`.
3. Verify visible comments use `author_display` from API payloads and open their profile routes.
4. Open `http://localhost:5174/#/pages/more/profile?id=user_002` and verify the display name/avatar derive from public post author summaries.
5. Open `http://localhost:5174/#/pages/more/profile` and verify self display derives from `/auth/me`.
