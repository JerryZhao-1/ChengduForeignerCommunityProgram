## Why

Week 8 needs to turn the now-complete `places` surfaces into one verified end-to-end chain in CloudBase `dev`, while also moving the real volunteer collection spreadsheet into the backend in a controlled, reviewable way.

The current product can demonstrate `places` in mock/local paths, but release readiness requires real-data edge-case handling, CloudBase-backed admin/public parity, and a repeatable import path that does not accidentally publish incomplete volunteer data.

## What Changes

- Add a volunteer spreadsheet import path for `docs/志愿者点位采集表.xlsx` that converts collected rows into backend `place` drafts or an equivalent admin-review intake flow.
- Preserve volunteer evidence and uncertain values as review context; do not expose them through public `places` payloads by default.
- Keep imported volunteer records unpublished until an administrator normalizes required public fields, coordinates, media, and publication state.
- Harden the complete mobile `places` chain across list, map, detail, category/tag filtering, recommendation entry, navigation, favorite state, and share-ready behavior.
- Add explicit handling and verification for real-data edge cases:
  - no gallery
  - no tags
  - no recommendation state
  - no marker because coordinates are missing or unusable
  - missing or incomplete address fields
- Close backend/admin issues that block `places` frontend quality, especially admin review visibility, draft/public separation, gallery media resolution, and map marker safety.
- Verify the complete `places` chain in CloudBase `dev`, not only mock mode:
  - public list
  - map markers
  - detail
  - admin create/update
  - gallery media read
- Deploy `community-map-api` as the formal CloudBase dev HTTP function before creating the HTTP access service `/api` route.
- Update docs and validation evidence so Week 8 status reflects actual deployed function, route, imported volunteer data, and known limitations.

## Capabilities

### New Capabilities

- `places-volunteer-import`: Covers importing volunteer spreadsheet records into backend/admin review without treating raw volunteer data as publication-ready public `place` data.
- `places-week8-cloudbase-acceptance`: Covers CloudBase `dev` deployment, HTTP function routing, and complete places end-to-end acceptance evidence.

### Modified Capabilities

- `places-admin-management`: Admin must support review and completion of imported volunteer drafts, including quality signals for fields that block publication.
- `places-public-contract`: Public list, marker, and detail contracts must remain valid and safe for imported real data with missing optional fields.
- `places-public-list-query`: Public list behavior must remain stable for imported records, including draft visibility and empty-result edge cases.
- `places-map-browsing`: Map browsing must handle no-marker and invalid-coordinate cases without broken UI or unnecessary detail fetches.
- `places-detail-media-experience`: Detail must handle no gallery, no tags, missing address, and gallery media resolution consistently.
- `places-query-baseline`: Mock, Koa, CloudBase handler, and CloudBase provider paths must stay aligned for Week 8 places reads and admin mutations.

## Impact

- Affected code:
  - `scripts/**` or an equivalent import utility path for spreadsheet parsing and backend seeding
  - `packages/shared/src/schemas/**`
  - `packages/shared/src/contracts/**`
  - `packages/shared/src/client.ts`
  - `packages/shared/src/mock/**`
  - `apps/api/src/cloudbase.ts`
  - `apps/api/src/routes/places.ts`
  - `apps/api/src/providers/**`
  - `apps/admin/src/pages/PlacesPage.vue`
  - `apps/mobile/src/pages/places/**`
- Affected data/docs:
  - `docs/志愿者点位采集表.xlsx`
  - `docs/点位采集审核与映射说明-v1.md`
  - `docs/cloudbase-week4-deployment-baseline.md` or a Week 8 deployment evidence document
  - `docs/已实现API接口清单.md`
  - `docs/plan.md`
- Affected systems:
  - CloudBase `dev` environment `cloud1-d7gxdk8t43bd639c0`
  - CloudBase function `community-map-api`
  - CloudBase HTTP access service `/api` route
  - CloudBase `places` and `file_assets` collections
  - CloudBase storage path `public/places/{place_id}/`
- No production CloudBase environment or production data writes are in scope for this change.
