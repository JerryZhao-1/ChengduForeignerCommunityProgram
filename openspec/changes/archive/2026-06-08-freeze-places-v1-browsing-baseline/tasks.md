## 1. Shared Contract

- [x] 1.1 Freeze the places v1 public browsing contract in shared types and tests [#R1]
  - ACCEPT: `places` list/detail/map-markers contracts remain split by surface, list query fields are fixed to the v1 set, and shared tests cover query parsing plus list/detail/marker payload boundaries.
  - TEST: SCOPE: CLI
    - Run `corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts` from repo root and confirm the places contract tests pass.

## 2. API Query Baseline

- [x] 2.1 Align mock, Koa, CloudBase handler, and CloudBase provider for places public reads [#R2]
  - ACCEPT: `/places`, `/places/:id`, and `/places/map-markers` expose identical v1 semantics across provider paths for published visibility, community scoping, filtering, sorting, and marker payload shape.
  - TEST: SCOPE: CLI
    - Run `corepack pnpm vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts` from repo root and confirm the places API tests pass.

## 3. Mobile Skeleton

- [x] 3.1 Rebuild places list, map, and detail as the v1 browsing skeleton [#R3]
  - ACCEPT: `index.vue`, `map.vue`, and `detail.vue` use the frozen contract, real data binding, and a shared loading/empty/error treatment; locale-specific copy is centralized instead of duplicated per page.
  - TEST: SCOPE: CLI
    - Run `corepack pnpm --filter @community-map/mobile typecheck` from repo root and confirm the places mobile pages compile.

- [x] 3.2 Merge recommended browsing into list filtering while preserving route compatibility [#R4]
  - ACCEPT: all new recommended entry points navigate to the list page with v1 recommended filters, and the legacy recommended page acts only as a redirect shim.
  - TEST: SCOPE: CLI
    - Inspect the updated mobile routes and confirm recommended navigation targets `/pages/places/index?recommended=true&sort=recommended`.

## 4. Validation

- [x] 4.1 Validate the new OpenSpec change and affected code paths [#R5]
  - ACCEPT: the new `freeze-places-v1-browsing-baseline` change validates in strict mode, and affected shared/API/mobile checks complete without errors.
  - TEST: SCOPE: CLI
    - Run `openspec validate freeze-places-v1-browsing-baseline --strict --no-interactive`
    - Run `corepack pnpm vitest run packages/shared/test/contracts.spec.ts packages/shared/test/client.spec.ts apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts`
    - Run `corepack pnpm --filter @community-map/shared typecheck`
    - Run `corepack pnpm --filter @community-map/api typecheck`
    - Run `corepack pnpm --filter @community-map/mobile typecheck`
