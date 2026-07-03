# Validation Bundle: add-map-marker-cover-preview R4

- change-id: add-map-marker-cover-preview
- run: run-0005
- task-id: 2.2
- ref-id: R4
- scope: MIXED

## How to Run

macOS/Linux start-server command:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0005__task-2.2__ref-R4__20260702T062846Z/run.sh
```

Windows start-server command:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0005__task-2.2__ref-R4__20260702T062846Z\run.bat
```

The scripts start the local API on `http://127.0.0.1:8787` and Mobile H5 on `http://127.0.0.1:5174/#/pages/places/map`.

## CLI Check

Run the CLI check described in `tests/cli_typecheck.md`. Expected exit code: 0.

## GUI Check

Use the MCP-only runbook in `tests/gui_runbook_cover_fallback.md`.

## Test Inputs

- `inputs/no-cover-place.json`: published marker seed with `cover_url: null`.
- `inputs/broken-cover-place.json`: published marker seed with a valid URL string that is expected to fail image loading.

## Data Preparation

After starting `run.sh` or `run.bat`, run these commands from this run folder:

```bash
curl -sS -X POST http://127.0.0.1:8787/admin/places \
  -H "content-type: application/json" \
  -H "x-mock-user-id: user_001" \
  --data-binary @inputs/no-cover-place.json \
  > outputs/no-cover-place-response.json

curl -sS -X POST http://127.0.0.1:8787/admin/places \
  -H "content-type: application/json" \
  -H "x-mock-user-id: user_001" \
  --data-binary @inputs/broken-cover-place.json \
  > outputs/broken-cover-place-response.json
```

Expected data-prep results:

- Each response JSON has `success: true`.
- The no-cover response has `data.cover_url === null`.
- The broken-cover response has `data.cover_url === "https://example.invalid/community-map/missing-cover.jpg"`.
- Each response data item has `status === "published"` and valid coordinates.

## Test Outputs

- `logs/api-dev.log`: API dev server log from `run.sh` / `run.bat`.
- `logs/mobile-h5-dev.log`: Mobile H5 dev server log from `run.sh` / `run.bat`.
- `logs/mobile-typecheck.log`: expected CLI typecheck log produced by the Supervisor.
- `outputs/no-cover-place-response.json`: API seed response for the null-cover marker.
- `outputs/broken-cover-place-response.json`: API seed response for the broken-cover marker.
- `outputs/screenshots/r4-no-cover-marker.png`: expected GUI screenshot evidence for the null-cover marker.
- `outputs/screenshots/r4-broken-cover-marker.png`: expected GUI screenshot evidence for the failed-cover marker.

## Expected Results

- `corepack pnpm --filter @community-map/mobile typecheck` exits with code 0.
- Selecting a marker with `cover_url: null` keeps the marker callout, summary card, detail CTA, and navigation CTA usable without showing a broken image placeholder.
- Selecting a marker whose image fails to load hides the cover preview and keeps the same marker selection and navigation affordances usable.

## Provenance

Expected results are derived from task 2.2 ACCEPT and the OpenSpec fallback requirements. Seed fixtures are generated from the ACCEPT block and project field conventions.
