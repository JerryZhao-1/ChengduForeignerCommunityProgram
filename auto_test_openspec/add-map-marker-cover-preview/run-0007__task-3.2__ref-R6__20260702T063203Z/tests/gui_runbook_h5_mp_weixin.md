# MCP GUI Runbook: Final H5 and mp-weixin Marker Preview

Use only MCP-controlled GUI operations. Do not use browser automation scripts.

## Preconditions

- Run `tests/run_cli_checks.sh` or `tests/run_cli_checks.bat` and confirm exit code 0.
- Start `run.sh` or `run.bat` for H5 validation.
- Run the H5 GUI data preparation command from `task.md`.
- Extract the seeded id from `outputs/cover-preview-place-response.json`.

## H5 Target

- URL: `http://127.0.0.1:5174/#/pages/places/map`
- Marker fixture: `Cover Preview Test Place`, with `cover_url=http://127.0.0.1:5174/static/place-marker.svg`.

## H5 MCP Steps

1. Open `http://127.0.0.1:5174/#/pages/places/map?id=<cover-preview-id>` in the MCP browser.
2. Wait until the map title and selected summary card are visible.
3. Tap the marker or callout for `Cover Preview Test Place`.
4. Capture a screenshot to `outputs/screenshots/r6-h5-marker-cover-preview.png`.
5. Assert the screenshot shows:
   - selected marker or callout state,
   - selected cover preview inside the map,
   - selected summary card,
   - detail CTA,
   - native navigation CTA.
6. Inspect network activity and assert no place detail request is required before the marker preview and summary render.

## mp-weixin Target

Use an MCP-controlled WeChat Mini Program validation target when available.

1. Build or start the mp-weixin target with the project command `corepack pnpm --filter @community-map/mobile dev:mp-weixin`.
2. Open the generated mini program project at `apps/mobile/dist/dev/mp-weixin` using the available MCP-controlled WeChat Mini Program target.
3. Navigate to `/pages/places/map`.
4. Tap the marker or callout for `Tongzilin Community Center`.
5. Capture a screenshot to `outputs/screenshots/r6-mp-weixin-marker-cover-preview.png`.
6. Assert the screenshot shows selected marker/callout state, selected cover preview, selected summary card, detail CTA, and native navigation CTA.

If an MCP-controlled mp-weixin target is unavailable, record the blocker in `logs/gui-evidence-r6.md` with:

- platform attempted,
- exact unavailable tool or app state,
- whether H5 evidence passed,
- follow-up owner.

## Evidence

Record screenshot paths, network/console observations, and any mp-weixin blocker in `logs/gui-evidence-r6.md`.
