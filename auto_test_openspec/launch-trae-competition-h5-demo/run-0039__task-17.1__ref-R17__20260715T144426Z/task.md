# R17 privacy-fix validation run 0039

- Change: `launch-trae-competition-h5-demo`
- Run: `0039`
- Task / ref: `17.1` / `R17`
- Scope: CLI
- Executor identity: Codex local validation; not TRAE evidence and not a Supervisor verdict
- Final decision: `pending_supervisor`

## Purpose

Validate the accepted privacy finding that the raw `scenario_key` encoded all four logical preferences in generation logs. The public Community Plan response and shared matcher remain unchanged; only API observability and its active specification are in scope.

Before the implementation change, the focused regression test failed because the log contained the extra `scenario_key` field. Run 0039 validates the corrected source state and the complete repository gate.

## Run

macOS/Linux:

```bash
bash auto_test_openspec/launch-trae-competition-h5-demo/run-0039__task-17.1__ref-R17__20260715T144426Z/run.sh
```

Windows:

```bat
auto_test_openspec\launch-trae-competition-h5-demo\run-0039__task-17.1__ref-R17__20260715T144426Z\run.bat
```

## Expected results

- API typecheck and focused Community Plan API tests pass.
- Root typecheck, test, and lint pass.
- H5 and mp-weixin production builds pass.
- strict OpenSpec validation passes.
- API route source contains no logged `scenario_key`.
- no added TypeScript type-suppression escape is present.
- `outputs/checks.json` matches `expected/checks.json`.
- `finalDecision` remains `pending_supervisor`; this run does not claim TRAE or Supervisor execution.

## Outputs

- `logs/run.log`: exact command transcript.
- `outputs/checks.json`: machine-readable completed-worker checks.

Expected values are derived directly from the accepted finding and the R17 repository gate. There is no GUI, deployment, public URL, or TRAE Session evidence in this run.
