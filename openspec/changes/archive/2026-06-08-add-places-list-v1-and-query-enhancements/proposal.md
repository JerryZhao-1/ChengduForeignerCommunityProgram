# Change: Add places list v1 and query enhancements

## Why

The current `places` list page in `apps/mobile/src/pages/places/index.vue` already calls the backend, but it still behaves like a placeholder browsing surface instead of a v1-ready list experience.

The home page `Places` section still presents the module as a reserved or partial surface instead of a clear public entry. At the same time, the public list contract and mock-backed behavior already exist, but the v1 rules for filtering, sorting, pagination, and `published` visibility still need to be consolidated as the implementation truth.

## What Changes

- Complete the `places` list page v1 with place cards, keyword search, category entry, recommendation entry, and shared async states
- Freeze and document `GET /places` as the v1 public list truth for filtering, sorting, pagination, and `published` visibility
- Turn the home page `Places` section into a real list entry while keeping place preview items
- Record the Figma design reference in a change-local `design.md`
- Narrow this change to list, home entry, and public list query behavior only

## Relationship To Existing Changes

- This change covers the list, home entry, and public list query subset currently implied by `complete-places-frontend-and-backend-foundation`
- Map, detail, admin, and persisted favorite/share work stay in other changes or later proposals
- Future changes should treat this change as the source of truth for `places` list browsing and public list query semantics instead of redefining them in the broader change

## Impact

- Affected specs:
  - `places-list-browsing`
  - `places-public-list-query`
- Affected code:
  - `apps/mobile/src/pages/places/index.vue`
  - `apps/mobile/src/pages/home/index.vue`
  - `apps/api/src/routes/places.ts`
  - `apps/api/src/providers/**`
  - `packages/shared/src/{schemas,contracts,client,mock}/places*`
