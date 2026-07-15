# Polish curated route judge journey validation

- Change: `launch-trae-competition-h5-demo`
- Run: `0033`
- Task: `16.1`
- Ref: `R16`
- Scope: `MIXED`
- Provenance: worker bundle prepared after route-map.vue was changed to render the full two-stop ordered route (place + event) and `route.openEvent` was added to the central zh/en catalog. R11 shared contracts were re-verified (typecheck exit 0, 62/62 tests PASS) with no code changes; run-0031 remains authoritative for R11. R15 mobile adapter parity was re-verified (mobile typecheck exit 0, 30/30 tests PASS) with no contract changes; run-0032 remains authoritative for R15.

## How to run

The start scripts only start the H5 service with `VITE_API_MODE=mock`, as required for GUI/MIXED bundles:

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0033__task-16.1__ref-R16__20260715T125139Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0033__task-16.1__ref-R16__20260715T125139Z\run.bat`
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

Before starting the service, the Supervisor runs and records these CLI checks separately:

```bash
pnpm --filter @community-map/mobile typecheck
pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts
pnpm --filter @community-map/mobile build:h5
pnpm --filter @community-map/mobile build:mp-weixin
```

On Windows, run the same commands in PowerShell or Command Prompt. Save the transcript as `logs/preflight.log`. Then execute the MCP-only instructions in `tests/gui_runbook_judge_journey.md`; do not use a browser automation script.

## Test inputs and outputs

- Inputs: mock-mode H5, four representative profiles (community-service/solo/first-week/none, food-drink/family-with-kids/first-month/wheelchair, social/couple/settled/low-vision, outdoor-sports/shared/first-week/quiet-environment), zh/en locales, 390px and desktop viewports, map-SDK-unavailable degradation.
- Outputs: `logs/preflight.log`, `logs/gui-screenshot-index.md`, `logs/supervisor-verdict.md`, and browser screenshots under `outputs/`.

## Expected result

### CLI assertions
- `pnpm --filter @community-map/mobile typecheck` exits `0`.
- `pnpm exec vitest run apps/mobile/src/stores/onboarding-store.spec.ts apps/mobile/src/api/community-plan-adapter.spec.ts apps/mobile/src/i18n/catalog.spec.ts` exits `0` with all tests PASS.
- `pnpm --filter @community-map/mobile build:h5` exits `0` (build complete).
- `pnpm --filter @community-map/mobile build:mp-weixin` exits `0` (build complete, no competition entry exposed).

### GUI assertions (MCP runbook)
- welcome → complete completes within 180 seconds for at least one representative profile.
- route-map renders the full ordered two-stop route (place_visit + event_attend); both stops have a "查看地点 / View place" or "查看活动 / View event" button; map-unavailable notice is shown and the route list remains fully usable.
- Place visit, Demo Confirm, and Finish Route states are correct; Finish is disabled until place visited and event demo-confirmed.
- Place detail 404 marks the place unavailable and the completion denominator adjusts (complete page shows adjusted total).
- Switching zh/en does not lose the current plan; only rendering language changes.
- Refresh or stateless deep link to plan/route-map/complete redirects to welcome.
- Start Over resets and returns to welcome.
- Demo Confirm is accompanied by a disclosure that it creates no registration, reservation, ticket, or capacity hold.
- Visual system follows DESIGN.md field-guide palette (`#F6F0E5`/`#0F766E`/`#123B3A`/`#E66A45`/`#D39A3A`), Fraunces/Songti SC headings, dashed editorial separators, 390px single column, desktop max-width centered.
- 390px viewport has no horizontal scroll; buttons and keyboard targets are at least 44px with visible focus.
- No new UI library, no AI/tech-style, no emoji icons, no meaningless animations.

## Provenance of expected

Expected behavior is derived from the task 16.1 ACCEPT block, the `trae-competition-h5-experience` spec, and `docs/competition/design/DESIGN.md`. CLI assertions are exit-code based; GUI assertions are screenshot/state based per the MCP runbook.
