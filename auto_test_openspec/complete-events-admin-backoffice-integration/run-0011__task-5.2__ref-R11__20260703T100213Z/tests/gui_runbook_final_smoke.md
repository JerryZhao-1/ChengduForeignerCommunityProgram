# GUI MCP Runbook: Final Admin And Mobile Smoke

Use MCP browser control only.

1. Open Admin `http://127.0.0.1:5173/events`.
2. Create a draft named `Final Smoke Event`.
3. Confirm it appears in Admin and is absent from Mobile H5 `http://127.0.0.1:5174/#/pages/events/index`.
4. Edit the event capacity and title; refresh Admin and confirm persistence.
5. Publish it from Admin; confirm success message and Mobile visibility.
6. Open the registration drawer for `Weekend Neighborhood Brunch`; confirm existing registration ticket state.
7. Check in `ticket_001`; confirm used status and repeated check-in error.
8. Take `Final Smoke Event` offline; confirm Mobile hidden state.
9. Republish it; confirm Mobile visibility returns.
10. Capture screenshots for Admin table, create/edit dialog, registration drawer, check-in success/error, and Mobile visible/hidden states under `outputs/screenshots/`; write paths and console summary to `logs/screenshots.md`.
