# MCP GUI Runbook: Cover Fallbacks

Use only MCP browser operations. Do not use browser automation scripts.

## Preconditions

- Start `run.sh` or `run.bat`.
- Complete the CLI check in `tests/cli_typecheck.md`.
- Run the data preparation commands from `task.md`.
- Extract the seeded ids from `outputs/no-cover-place-response.json` and `outputs/broken-cover-place-response.json`.

## Targets

- Mobile H5 map URL: `http://127.0.0.1:5174/#/pages/places/map`
- Null-cover marker: `No Cover Test Place`
- Failed-cover marker: `Broken Cover Test Place`

## MCP Steps: Null Cover

1. Open `http://127.0.0.1:5174/#/pages/places/map?id=<no-cover-id>`.
2. Wait until the selected summary card shows `No Cover Test Place`.
3. Capture a screenshot to `outputs/screenshots/r4-no-cover-marker.png`.
4. Assert the screenshot shows:
   - selected marker or callout state,
   - selected summary card,
   - detail CTA,
   - native navigation CTA,
   - no broken image placeholder and no selected cover preview image.
5. Activate the detail CTA and assert navigation targets `#/pages/places/detail?id=<no-cover-id>`.

## MCP Steps: Failed Cover

1. Open `http://127.0.0.1:5174/#/pages/places/map?id=<broken-cover-id>`.
2. Wait until the selected summary card shows `Broken Cover Test Place`.
3. Wait for the cover image request to fail or for the preview to disappear after the image error handler runs.
4. Capture a screenshot to `outputs/screenshots/r4-broken-cover-marker.png`.
5. Assert the screenshot shows:
   - selected marker or callout state,
   - selected summary card,
   - detail CTA,
   - native navigation CTA,
   - no broken image placeholder as the primary selected-marker affordance.
6. Activate the detail CTA and assert navigation targets `#/pages/places/detail?id=<broken-cover-id>`.

## Evidence

Record screenshot paths, seeded ids, and any network/console observations in `logs/gui-evidence-r4.md`.
