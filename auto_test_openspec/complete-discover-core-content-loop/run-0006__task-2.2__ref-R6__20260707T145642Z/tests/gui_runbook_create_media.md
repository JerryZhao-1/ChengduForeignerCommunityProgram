# MCP GUI Runbook: Create Post Media

Use playwright-mcp only; do not use browser automation scripts.

1. Start API and Mobile H5 in HTTP mode from the repository root.
2. Open `/pages/discover/create`.
3. Verify the primary media picker control is present and URL paste is labeled as a dev fallback.
4. Create a text-only post and capture redirect/detail evidence.
5. In an environment where file picker interaction is available, select an image or video and capture upload/progress/removal states.
6. Submit a media-backed post and capture detail evidence that media renders from the created post.
