# Task 3.2 Gallery Media Evidence Or Blocker

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0007
- task-id: 3.2
- ref-id: R7
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- Existing deterministic place: `CloudBase Live Acceptance Place`
- CloudBase dev API base URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

## Outputs

- `outputs/public-detail.json`
- either `outputs/gallery-success.json` or `outputs/gallery-blocker.json`
- `outputs/assertions.json`
- `logs/run.log`

## Expected Results

The script exits 0 when it either proves real CloudBase gallery media resolution through `cloud://` file ids and temporary HTTPS URLs, or records a precise blocker. A blocker is not a claim that gallery media acceptance is complete.
