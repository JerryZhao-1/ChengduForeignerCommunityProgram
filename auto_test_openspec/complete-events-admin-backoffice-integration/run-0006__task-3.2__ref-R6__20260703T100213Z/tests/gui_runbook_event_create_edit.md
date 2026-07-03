# GUI MCP Runbook: Create And Edit Event

Use MCP browser control only.

1. Open `http://127.0.0.1:5173/events`.
2. Click `新建活动`.
3. Set titles to `MCP Draft Event` and `MCP Draft Event EN`; keep publish status `草稿`.
4. Save and confirm a success message and row appears.
5. Open edit for the new row, change capacity to `36`, update title suffix to `Edited`, save, refresh, and confirm persistence.
6. Open edit again, clear the cover URL or set it to an invalid URL, save, and confirm the dialog stays open with an error.
7. Capture create/edit/error screenshots under `outputs/screenshots/` and write paths to `logs/screenshots.md`.
