# Validation Bundle: add-map-marker-cover-preview R3

- change-id: add-map-marker-cover-preview
- run: run-0004
- task-id: 2.1
- ref-id: R3
- scope: MIXED

## How to Run

macOS/Linux start-server command:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0004__task-2.1__ref-R3__20260702T062751Z/run.sh
```

Windows start-server command:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0004__task-2.1__ref-R3__20260702T062751Z\run.bat
```

The scripts start the local API on `http://127.0.0.1:8787` and Mobile H5 on `http://127.0.0.1:5174/#/pages/places/map`.

## CLI Check

Run the CLI check described in `tests/cli_typecheck.md`. Expected exit code: 0.

## GUI Check

Use the MCP-only runbook in `tests/gui_runbook_marker_cover_preview.md`.

## Test Inputs

- `inputs/cover-preview-place.json`: published marker seed with a local Mobile H5 static asset URL as `cover_url`.

## Data Preparation

After starting `run.sh` or `run.bat`, run this command from this run folder:

```bash
curl -sS -X POST http://127.0.0.1:8787/admin/places \
  -H "content-type: application/json" \
  -H "x-mock-user-id: user_001" \
  --data-binary @inputs/cover-preview-place.json \
  > outputs/cover-preview-place-response.json
```

Expected data-prep result:

- Response JSON has `success: true`.
- Response data has `cover_url === "http://127.0.0.1:5174/static/place-marker.svg"`.
- Response data has `status === "published"` and valid coordinates.

## Test Outputs

- `logs/api-dev.log`: API dev server log from `run.sh` / `run.bat`.
- `logs/mobile-h5-dev.log`: Mobile H5 dev server log from `run.sh` / `run.bat`.
- `logs/mobile-typecheck.log`: expected CLI typecheck log produced by the Supervisor.
- `outputs/cover-preview-place-response.json`: API seed response for the covered marker.
- `outputs/screenshots/r3-marker-cover-preview.png`: expected GUI screenshot evidence from MCP.

## Expected Results

- `corepack pnpm --filter @community-map/mobile typecheck` exits with code 0.
- Opening the Mobile H5 map and selecting the seeded covered marker shows a white-bordered cover preview inside the map, near the selected marker.
- The existing selected summary card remains visible with localized name, top-level category, recommended badge, detail CTA, and navigation CTA.
- The map page does not fetch place detail just to render the selected cover preview.

## Provenance

Expected results are derived from task 2.1 ACCEPT and the `places-map-browsing` OpenSpec delta.
