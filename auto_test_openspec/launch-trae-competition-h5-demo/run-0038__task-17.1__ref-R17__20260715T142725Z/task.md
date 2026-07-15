# R17 run-0038 — post-GUI-fix release gate

- Task / Ref: 17.1 / R17
- Scope: CLI
- Supersedes for current R17 evidence: run-0035, which remains immutable PASS for the pre-fix source state.
- Inputs: the scoped plan-page locale-switch correction verified by R16 run-0037.
- Worker output remains `pending_supervisor`; only `logs/supervisor-verdict.md` may declare the final result.

## Acceptance

- Strict OpenSpec, shared/API/mobile/root typechecks, repository tests, lint, H5 build, and mp-weixin build pass.
- Focused catalog/store/adapter/coverage/parity tests pass.
- Build entry artifacts exist.
- Forbidden model-runtime scan distinguishes `rg` no-match exit 1 from execution errors and fails closed on exit 2+.
- Production source changes are limited to the plan locale control, its catalog copy, and its regression test; added lines contain no type-suppression escape.
- Computed checks exactly match the expected machine-readable result.

After execution and Supervisor verdict, this folder is immutable.
