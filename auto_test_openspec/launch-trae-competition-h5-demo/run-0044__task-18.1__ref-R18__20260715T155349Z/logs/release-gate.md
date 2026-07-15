# Release gate results

All commands ran from the repository root on 2026-07-15.

| Check | Result |
| --- | --- |
| `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` | exit 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | exit 0; 36 files, 283/283 tests |
| `pnpm lint` | exit 0 |
| `pnpm --filter @community-map/mobile build:h5` | exit 0; DONE |
| `pnpm --filter @community-map/mobile build:mp-weixin` | exit 0; DONE |
| focused API CORS suite | exit 0; 21/21 |
| API typecheck | exit 0 |
| CloudBase HTTP bundle | exit 0 |
| forbidden type-suppression diff scan | no added `any`, `as any`, `@ts-ignore`, or `@ts-nocheck` |

The first lint attempt after Vercel prebuild inspected generated
`.vercel/output` files and failed. The root ESLint ignore list now treats
`.vercel` like other generated output; the complete gate above was rerun and
passed.

## Actual prebuilt artifact scan

- Files: 91
- Sorted manifest SHA-256:
  `6b3a8d18b08bb0ea1587eef3b88776267789fc9c78fd87ccb5450910f56fd2f0`
- Production API URL: 1 occurrence
- `localhost`, `127.0.0.1`, mock actor/header names, server secret names,
  OpenAI/Anthropic markers, model endpoint/result markers: 0 occurrences each
