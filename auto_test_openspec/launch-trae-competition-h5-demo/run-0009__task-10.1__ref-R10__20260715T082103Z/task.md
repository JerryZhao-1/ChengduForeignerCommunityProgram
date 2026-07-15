# Curated-catalog specification migration validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0009`
- Task: `10.1`
- Ref: `R10`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 10.1 ACCEPT/TEST after runs 0001–0008 were found structurally incomplete.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0009__task-10.1__ref-R10__20260715T082103Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0009__task-10.1__ref-R10__20260715T082103Z\run.bat`

The scripts resolve the repository from their own directory and write the command transcript to `logs/run.log`.

## Inputs and outputs

- Inputs: the active OpenSpec artifacts and current runtime source under `apps/api/src`, `apps/mobile/src`, and `packages/shared/src`.
- Output: `logs/run.log` containing strict validation and the stale-runtime-claim scan.

## Expected result

- `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` exits `0`.
- `apps/api/src/lib/community-plan-ai.ts` does not exist.
- No current runtime source matches `community-plan-ai`, `DEEPSEEK`, `deepseek`, `generation_source`, or `ai_status`.
- The script exits non-zero on any failed assertion. A Supervisor records the final PASS/FAIL decision and evidence pointer after execution.

