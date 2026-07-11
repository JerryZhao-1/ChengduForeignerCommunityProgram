# Task 1.2 shared bilingual contracts validation

- Change: `complete-mobile-english-language-support`
- Run: `#2`
- Task: `1.2`
- Ref: `R2`
- Scope: `CLI`

## How to run

- macOS/Linux: `./run.sh`
- Windows: `run.bat`

The scripts run focused bilingual/shared contract tests plus `pnpm --filter @community-map/shared typecheck`, capture transcripts under `logs/`, and write `outputs/result.json`.

## Inputs, outputs, and expected rules

- `inputs/contracts-cases.json` inventories legacy/current Event and Notification shapes, locale values, and readiness cases.
- `expected/result.rules.json` records the assertions derived from R2 ACCEPT.
- `outputs/result.json` records exact commands, exit codes, and artifact pointers.
- Logs are `logs/focused-shared-tests.log` and `logs/shared-typecheck.log`.

The tests parse real contract fixtures, assert exact readiness issue fields, verify draft/public separation and conditional recommendation reasons, and assert list/marker projections do not gain detail-only fields.

## Machine-decidable criteria

- Focused Vitest exits `0` with 31 passing tests.
- Shared typecheck exits `0`.
- Contract fixtures cover legacy/current Event and Notification records and reject unsupported locale values.
- Readiness tests cover whitespace, placeholders, drafts, complete candidates, and recommended Places.

Expected data comes from the OpenSpec R2 acceptance criteria. No secrets or external services are used.
