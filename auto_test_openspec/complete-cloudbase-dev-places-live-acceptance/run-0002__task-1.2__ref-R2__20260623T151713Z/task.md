# Task 1.2 Volunteer Draft Import

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0002
- task-id: 1.2
- ref-id: R2
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- `docs/志愿者点位采集表.xlsx`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin actor header: `x-mock-user-id: user_001`

## Outputs

- `outputs/import-execution.json`
- `outputs/admin-places.json`
- `outputs/imported-admin-drafts.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when the spreadsheet maps to draft records, the admin API writes succeed, imported source ids are visible through `/admin/places`, and imported records remain `status="draft"`.
