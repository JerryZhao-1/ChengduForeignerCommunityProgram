# Release gate results

| Check | Result |
| --- | --- |
| `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` | exit 0 |
| `pnpm test` | 38 files, 289/289 passed |
| `pnpm typecheck` | all four packages passed |
| `pnpm lint` | exit 0 |
| production-API Mobile H5 build | exit 0 |
| Mobile MP build | exit 0 |
| production-API Admin build | exit 0 |
| `pnpm exec vitest run scripts/competition-demo-content.spec.ts` | 4/4 passed |
| prohibited type escape scan | no match |
| H5/Admin frontend-secret scan | no prohibited match |

Allowed public bundle value: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.

The final `.ts` extension on the manifest's shared import exists only for the fixed transient `tsx@4.21.0` executor; focused tests, full typecheck, and lint passed again.
