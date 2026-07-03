# MCP GUI Runbook: Marker Cover Preview

Use only MCP browser operations. Do not use browser automation scripts.

## Preconditions

- Start `run.sh` or `run.bat`.
- Complete the CLI check in `tests/cli_typecheck.md`.
- Run the data preparation command from `task.md`.
- Extract the seeded id from `outputs/cover-preview-place-response.json`.

## Target

- Mobile H5 map URL: `http://127.0.0.1:5174/#/pages/places/map`
- Covered marker fixture: `Cover Preview Test Place`, `cover_url=http://127.0.0.1:5174/static/place-marker.svg`

## MCP Steps

1. Open `http://127.0.0.1:5174/#/pages/places/map?id=<cover-preview-id>` with the MCP browser.
2. Wait until the map page title and selected summary card are visible.
3. Tap the marker or callout for `Cover Preview Test Place`.
4. Capture a screenshot to `outputs/screenshots/r3-marker-cover-preview.png`.
5. Assert the screenshot shows:
   - a selected marker/callout state on the map,
   - a white-bordered cover preview inside the map,
   - the selected summary card with `Cover Preview Test Place`,
   - the category text,
   - the recommended badge,
   - the detail CTA,
   - the native navigation CTA.
6. Inspect browser network activity and assert no `GET /places/place_001` request is required before the preview and summary render.
7. Activate the detail CTA and assert navigation targets `#/pages/places/detail?id=<cover-preview-id>`.

## Evidence

Record screenshot paths and any network/console observations in `logs/gui-evidence-r3.md`.
