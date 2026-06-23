# Task 1.1 Baseline Capture

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0010
- task-id: 1.1
- ref-id: R1
- SCOPE: CLI

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

## Inputs

- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Admin actor header: `x-mock-user-id: user_001`

## Outputs

- `outputs/health.json`
- `outputs/public-list.json`
- `outputs/public-markers.json`
- `outputs/admin-places.json`
- `outputs/baseline-summary.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 only when `/health`, `/places`, `/places/map-markers`, and `/admin/places` are reachable and baseline counts/request ids are captured.
