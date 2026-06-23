# Task 2.3 Draft Visibility Denial

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0005
- task-id: 2.3
- ref-id: R5
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- At least one imported `draft` place with `import_review.source_import_id`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin actor header: `x-mock-user-id: user_001`

## Outputs

- `outputs/admin-places.json`
- `outputs/public-list.json`
- `outputs/public-markers.json`
- `outputs/draft-public-detail.json`
- `outputs/draft-denial-summary.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when a known draft is visible through admin reads, absent from public list/markers, and public detail returns a 404 error envelope without review metadata.
