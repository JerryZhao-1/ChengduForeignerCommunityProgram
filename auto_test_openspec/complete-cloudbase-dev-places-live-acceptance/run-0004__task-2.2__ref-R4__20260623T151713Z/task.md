# Task 2.2 Public Reads For Published Place

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0004
- task-id: 2.2
- ref-id: R4
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- Existing deterministic place: `CloudBase Live Acceptance Place`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

## Outputs

- `outputs/public-list.json`
- `outputs/public-markers.json`
- `outputs/public-detail.json`
- `outputs/public-verification-summary.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when the published place is present in list, marker, and detail reads, list/marker payloads remain scoped, and detail includes navigation/share without exposing `import_review`.
