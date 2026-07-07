# MCP GUI Runbook: My Posts

Use playwright-mcp only; do not use browser automation scripts.

1. Start API and Mobile H5 in HTTP mode from the repository root with actor `user_001`.
2. Open `/pages/more/my-posts`.
3. Capture evidence that user-owned posts load and phase-placeholder copy is absent.
4. Capture evidence that a hidden owned post status is shown.
5. Tap a public owned post and capture detail navigation evidence.
6. Repeat with an actor that has no owned posts if available and capture the empty state.
