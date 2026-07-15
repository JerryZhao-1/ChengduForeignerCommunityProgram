# S07B TRAE session evidence

- Session: `复核并锁定 Community Plan 确定性契约 (R11)`
- Surface: `TRAE Builder`
- Captured: `2026-07-15`
- Screenshot: `trae-session-overview.jpg`
- Screenshot SHA-256: `53954e9ab74dd03eaa9c7ad417c4680a15ef9afcee02438cb00e2a0431758a77`
- Capture method: Computer Use capture from the live `TRAE Work CN` application window.
- Session ID: `1765147662888432:88ee57aeaa1c925d02d390639dcd8b39_6a574ef19a8237841b12caa0.6a574ef19a8237841b12caa3.6a574ef19a8237841b12caa1:TRAE Work CN.0.1.35.no_sid.no_ppe.T(2026/7/15 17:12:17)`

This TRAE Builder session reviewed and locked the deterministic Community Plan shared contracts (R11). The session confirmed that `NewResidentPreferenceSchema` accepts only five strict singular fields, `CommunityPlanSchema` requires `scenario_key`, `catalog_version`, four ordered reasons, and a strict two-station route, and that no `generated_by`/`ai_status`/`usage`/`model`/`prompt` fields exist in the response. The session strengthened rejection coverage in `packages/shared/test/community-plans.spec.ts` for `model`/`prompt` response fields, expanded projection leakage fields (place 10 + event 8), and expanded PII request fields (`email`/`name`/`user_id`/`openid`). A new immutable validation bundle was created at `auto_test_openspec/launch-trae-competition-h5-demo/run-0021__task-11.1__ref-R11__20260715T091919Z/`. The full Session ID is recorded here because the application viewport truncates long identifiers visually. No schema, contract, or source code was modified; only test coverage was strengthened.

## Verification outputs

- Shared typecheck: exit 0
- Focused tests: 3 files passed, 54 tests passed (14 + 14 + 26), 0 failed
- Validation bundle: `run-0021` retained as an immutable worker bundle; corrected Supervisor retry `run-0022` passed with real log, machine-readable result, and verdict.

## Related artifacts

- Test file: `packages/shared/test/community-plans.spec.ts`
- Worker bundle: `auto_test_openspec/launch-trae-competition-h5-demo/run-0021__task-11.1__ref-R11__20260715T091919Z/`
- Supervisor PASS bundle: `auto_test_openspec/launch-trae-competition-h5-demo/run-0022__task-11.1__ref-R11__20260715T092820Z/`
- Git HEAD at session time: `dab330b` (changes staged for commit, not yet committed)
- Branch: `competition/trae-h5-demo`
