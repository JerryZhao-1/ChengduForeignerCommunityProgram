# R17 privacy-fix validation run 0040

- Change: `launch-trae-competition-h5-demo`
- Run: `0040`
- Task / ref: `17.1` / `R17`
- Scope: CLI
- Executor identity: Codex local validation; not TRAE evidence and not a Supervisor verdict
- Final decision: `pending_supervisor`

## Purpose

Validate the accepted privacy finding that raw `scenario_key` values encoded all four logical preferences in generation logs. The public response and shared matcher remain unchanged. Run 0039 failed before checks because the managed shell rejected process substitution; this append-only retry uses a standard pipe with `pipefail`.

The focused regression test was observed failing before the implementation change because the log contained the extra `scenario_key` field. This run validates the corrected source and complete repository gate.

## Run

```bash
bash auto_test_openspec/launch-trae-competition-h5-demo/run-0040__task-17.1__ref-R17__20260715T144513Z/run.sh
```

```bat
auto_test_openspec\launch-trae-competition-h5-demo\run-0040__task-17.1__ref-R17__20260715T144513Z\run.bat
```

## Expected results

- API typecheck and focused Community Plan API tests pass.
- root typecheck/test/lint and both mobile builds pass.
- strict OpenSpec validation passes.
- the generation route contains no raw `scenario_key` log field.
- no added TypeScript type-suppression escape is present.
- `outputs/checks.json` matches `expected/checks.json`.
- deployment is not performed and `finalDecision` remains `pending_supervisor`.

Outputs are `logs/run.log` and `outputs/checks.json`. Expected values come from the accepted finding and R17 gate. This run contains no GUI, deployment, public URL, TRAE Session, or Supervisor claim.
