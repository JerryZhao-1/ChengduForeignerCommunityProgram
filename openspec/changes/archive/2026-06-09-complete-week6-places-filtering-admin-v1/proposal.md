## Why

Week 6 needs to close the remaining `places` discovery and admin-maintenance loop so community users can filter/recommend places while operators can create, edit, publish, recommend, tag, and attach gallery media through backend-owned flows. The current codebase already contains much of the foundation, but the plan still requires a focused OpenSpec change to complete tag filtering, align mobile filter entries with shared taxonomy, and verify gallery media is traceable through `file_assets`.

## What Changes

- Extend public places browsing so `GET /places` supports tag filtering in addition to keyword, category, recommendation, sort, pagination, and published visibility.
- Keep recommended places as a list-filtered flow rather than a separate data source, with mobile entry points routing to the filtered list.
- Align mobile places category choices with the shared top-level taxonomy and add a clear tag-filter entry/reset flow under `apps/mobile/src/pages/places`.
- Complete admin places v1 maintenance for create/edit, bilingual intro, category, tags, recommendation state/reason/rank, publish state, coordinates, and optional Tencent POI reference.
- Keep place gallery attachment behind the files flow: upload/register file asset, persist `gallery_file_ids`, and resolve `GET /places/:id` media through `gallery_media` for mobile detail rendering.
- Preserve existing list, marker, and detail payload boundaries; no breaking API changes are introduced.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `places-public-list-query`: add the `tag` public list query input and require aligned filtering semantics across provider paths.
- `places-list-browsing`: add mobile tag-filter entry behavior and require category choices to come from the shared taxonomy truth.
- `places-admin-management`: complete admin places v1 maintenance and gallery attachment through backend-controlled file assets.
- `places-query-baseline`: keep the Week 6 query additions aligned across mock, Koa, CloudBase handler, and CloudBase provider paths.

## Impact

- Shared schemas/contracts/client types for places list query inputs.
- API route/provider behavior for `GET /places`, admin places create/update, and files-based place gallery attachment.
- Mobile `places` list/recommended entry flow under `apps/mobile/src/pages/places`.
- Admin places management form and file-asset gallery registration flow.
- Tests for shared contracts, API route behavior, CloudBase handler/provider parity, admin permissions, and detail media resolution.
