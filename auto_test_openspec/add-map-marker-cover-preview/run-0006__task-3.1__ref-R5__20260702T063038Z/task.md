# Validation Bundle: add-map-marker-cover-preview R5

- change-id: add-map-marker-cover-preview
- run: run-0006
- task-id: 3.1
- ref-id: R5
- scope: CLI

## How to Run

macOS/Linux:

```bash
auto_test_openspec/add-map-marker-cover-preview/run-0006__task-3.1__ref-R5__20260702T063038Z/run.sh
```

Windows:

```bat
auto_test_openspec\add-map-marker-cover-preview\run-0006__task-3.1__ref-R5__20260702T063038Z\run.bat
```

## Test Inputs

The bundle reads `docs/已实现API接口清单.md`.

## Test Outputs

- `logs/docs-marker-cover.log`: text assertion transcript.

## Expected Results

- The docs mention `/places/map-markers`.
- The docs list `cover_url` as part of the marker-safe payload.
- The docs state `cover_url` is `string | null` and used as a lightweight map marker preview field.
- The docs explicitly state marker payloads still exclude full address fields, intro bodies, `gallery_media`, `gallery_urls`, `external_gallery_media`, `cover_source`, and `navigation`.

## Provenance

Expected results are derived from task 3.1 ACCEPT and the public marker contract spec.
