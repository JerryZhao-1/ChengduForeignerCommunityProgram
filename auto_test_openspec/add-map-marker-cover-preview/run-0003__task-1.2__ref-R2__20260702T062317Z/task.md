# Validation Bundle: add-map-marker-cover-preview R2

- change-id: add-map-marker-cover-preview
- run: run-0003
- task-id: 1.2
- ref-id: R2
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0003__task-1.2__ref-R2__20260702T062317Z/run.sh
```

Windows:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0003__task-1.2__ref-R2__20260702T062317Z\run.bat
```

## Test Inputs

The bundle uses repository source and existing shared/API fixtures. No separate input files are required.

## Test Outputs

- `logs/provider-marker-cover.log`: Vitest output for focused shared client, shared marker, Koa API, and CloudBase handler/provider tests.

## Expected Results

- The focused Vitest command exits with code 0.
- Mock service and HTTP client marker paths return `cover_url`.
- Koa `/places/map-markers`, CloudBase HTTP function routing, and provider parity tests return `cover_url`.
- Marker payloads continue to exclude forbidden detail/media fields: address bodies, intro bodies, `gallery_urls`, `gallery_media`, `external_gallery_media`, `cover_source`, and `navigation`.
- Existing filtering, visibility, and deterministic marker ordering assertions continue to pass.

## Provenance

Expected results are derived from the task ACCEPT block and the OpenSpec provider payload requirements.
