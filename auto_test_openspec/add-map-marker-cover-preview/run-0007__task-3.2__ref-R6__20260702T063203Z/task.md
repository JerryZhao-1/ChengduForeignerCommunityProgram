# Validation Bundle: add-map-marker-cover-preview R6

- change-id: add-map-marker-cover-preview
- run: run-0007
- task-id: 3.2
- ref-id: R6
- scope: MIXED

## How to Run

macOS/Linux start-server command for GUI validation:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0007__task-3.2__ref-R6__20260702T063203Z/run.sh
```

Windows start-server command for GUI validation:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0007__task-3.2__ref-R6__20260702T063203Z\run.bat
```

The scripts start the local API on `http://127.0.0.1:8787` and Mobile H5 on `http://127.0.0.1:5174/#/pages/places/map`.

## CLI Checks

macOS/Linux:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0007__task-3.2__ref-R6__20260702T063203Z/tests/run_cli_checks.sh
```

Windows:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0007__task-3.2__ref-R6__20260702T063203Z\tests\run_cli_checks.bat
```

Expected exit code: 0.

## GUI Check

Use the MCP-only runbook in `tests/gui_runbook_h5_mp_weixin.md`.

## Test Inputs

- CLI checks use repository source, OpenSpec artifacts, and existing shared/API fixtures.
- `inputs/cover-preview-place.json`: published marker seed with a local Mobile H5 static asset URL as `cover_url` for H5 GUI evidence.

## H5 GUI Data Preparation

After starting `run.sh` or `run.bat`, run this command from this run folder before H5 GUI validation:

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

- `logs/openspec-validate.log`: strict OpenSpec validation output.
- `logs/focused-regression.log`: focused shared/API Vitest output.
- `logs/mobile-typecheck.log`: Mobile typecheck output.
- `logs/api-dev.log`: API dev server log from `run.sh` / `run.bat`.
- `logs/mobile-h5-dev.log`: Mobile H5 dev server log from `run.sh` / `run.bat`.
- `outputs/cover-preview-place-response.json`: API seed response for H5 GUI evidence.
- `outputs/screenshots/r6-h5-marker-cover-preview.png`: expected H5 screenshot evidence.
- `outputs/screenshots/r6-mp-weixin-marker-cover-preview.png`: expected mp-weixin screenshot evidence when that MCP target is available.

## Expected Results

- `openspec validate add-map-marker-cover-preview --strict --no-interactive` exits with code 0.
- Focused shared/API Vitest regression files exit with code 0.
- `corepack pnpm --filter @community-map/mobile typecheck` exits with code 0.
- H5 GUI evidence shows the seeded covered marker selection with cover preview, summary card, detail CTA, and native navigation CTA.
- mp-weixin GUI evidence records the same marker preview behavior when an MCP-controlled WeChat Mini Program target is available; otherwise `logs/gui-evidence-r6.md` records the exact blocker and platform.

## Provenance

Expected results are derived from task 3.2 ACCEPT, the final OpenSpec validation requirement, and the focused regression scope from tasks R1 through R5.
