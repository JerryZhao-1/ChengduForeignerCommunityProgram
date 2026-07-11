# Task 1.1 locale foundation validation

- Change: `complete-mobile-english-language-support`
- Run: `#1`
- Task: `1.1`
- Ref: `R1`
- Scope: `CLI`

## How to run

- macOS/Linux: `./run.sh`
- Windows: `run.bat`

Both scripts resolve the repository from their own directory, run the focused locale/helper and Event state tests, run `pnpm --filter @community-map/mobile typecheck`, scan the migrated Event domain helper for page-facing Chinese literals, capture transcripts under `logs/`, and write command/assertion results to `outputs/result.json`.

## Inputs and outputs

- Input cases: `inputs/locale-cases.json`, derived from task R1 ACCEPT and TEST requirements.
- Expected rules: `expected/result.rules.json`, derived from the same acceptance criteria.
- Runtime output: `outputs/result.json`.
- Command transcripts: `logs/focused-tests.log`, `logs/mobile-typecheck.log`, and `logs/domain-copy-scan.log`.

The focused TypeScript fixtures cover full language pairs, both fallback directions, both-missing required/optional values, interpolation, explicit date/number locales, stable Event state codes, and unchanged UGC content with a localized language badge.

## Machine-decidable criteria

- Focused Vitest command exits `0` and reports 12 passing tests.
- Mobile typecheck exits `0`.
- The Event domain-state helper contains no Han characters.
- `outputs/result.json` records all three zero exit codes and the exact commands.

No production credentials or external services are required.
