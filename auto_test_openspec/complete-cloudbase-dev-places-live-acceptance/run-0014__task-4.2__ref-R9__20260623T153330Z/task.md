# Task 4.2 Final Validation

- change-id: complete-cloudbase-dev-places-live-acceptance
- run: 0014
- task-id: 4.2
- ref-id: R9
- SCOPE: CLI

## How To Run

macOS/Linux: `./run.sh`

Windows: `run.bat`

## Inputs

- OpenSpec change artifacts
- Relevant shared/API test files
- Generated validation bundles under this change directory

## Outputs

- `outputs/final-validation.json`
- `outputs/assertions.json`
- command logs under `logs/`

## Expected Results

The script exits 0 only when strict OpenSpec validation, relevant shared/API tests, and shared/API typechecks pass.
