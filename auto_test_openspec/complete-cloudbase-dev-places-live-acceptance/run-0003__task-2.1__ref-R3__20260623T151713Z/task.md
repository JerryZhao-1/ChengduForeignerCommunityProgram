# Task 2.1 Published Acceptance Place

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0003
- task-id: 2.1
- ref-id: R3
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- Deterministic place name: `CloudBase Live Acceptance Place`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin actor header: `x-mock-user-id: user_001`

## Outputs

- `outputs/acceptance-place-write.json`
- `outputs/admin-places.json`
- `outputs/acceptance-place-summary.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when the acceptance place is created or updated through `/admin/places`, is `published`, has finite coordinates, and appears in the admin list.
