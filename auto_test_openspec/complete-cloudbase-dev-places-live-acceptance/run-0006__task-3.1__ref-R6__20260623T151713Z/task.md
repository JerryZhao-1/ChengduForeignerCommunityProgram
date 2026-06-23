# Task 3.1 Admin Update Visibility

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0006
- task-id: 3.1
- ref-id: R6
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- Existing deterministic place: `CloudBase Live Acceptance Place`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin actor header: `x-mock-user-id: user_001`

## Outputs

- `outputs/admin-update-response.json`
- before/after `outputs/public-list.json`, `outputs/public-markers.json`, and `outputs/public-detail.json`
- `outputs/admin-update-summary.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when a PATCH through `/admin/places/:id` succeeds and subsequent public list, marker, and detail reads reflect updated public fields while preserving payload boundaries.
