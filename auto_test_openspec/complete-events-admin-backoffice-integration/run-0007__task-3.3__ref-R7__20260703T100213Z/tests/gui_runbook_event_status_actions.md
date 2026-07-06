# GUI MCP Runbook: Status Actions

Use MCP browser control only.

1. Open Admin `http://127.0.0.1:5173/events`.
2. Create a draft named `MCP Publish Cycle Event`.
3. Click `通过并发布`; confirm button pending state and success message.
4. Open Mobile H5 `http://127.0.0.1:5174/#/pages/events/index`; confirm the event appears.
5. Return to Admin and click `下线`; confirm success message and offline tag.
6. Refresh Mobile H5 and confirm the event is absent.
7. Return to Admin and click `通过并发布`; confirm Mobile visibility returns.
8. Capture Admin and Mobile screenshots under `outputs/screenshots/` and write paths to `logs/screenshots.md`.
