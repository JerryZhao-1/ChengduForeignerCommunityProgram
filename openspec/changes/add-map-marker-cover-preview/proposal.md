## Why

The mobile places map currently confirms marker selection with text-only map callouts and a summary card below the map. Users need a faster visual cue after tapping a marker so they can recognize the selected place without leaving the map context.

This should happen without turning the map marker endpoint into a detail payload or requiring a detail fetch for the selected marker preview.

## What Changes

- Add a selected-marker cover preview to the mobile places map page.
- Extend the public map marker contract with nullable `cover_url` as a marker-safe preview field.
- Keep map markers bounded: no full address bodies, intro bodies, gallery arrays, external media arrays, cover source attribution, or navigation objects are added to marker payloads.
- Preserve the existing map-to-detail flow; the detail page still loads decision-useful detail data from `GET /places/:id`.
- Provide an empty-cover fallback so markers without `cover_url` remain selectable and navigable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `places-map-browsing`: Marker selection should show the selected place cover near the tapped marker when a cover is available, while preserving the existing selected summary and detail navigation.
- `places-public-contract`: `GET /places/map-markers` should include nullable `cover_url` as a marker-safe preview field while continuing to exclude detail-only and gallery/media payloads.

## Impact

- Affected shared contracts and tests:
  - `packages/shared/src/schemas/places.ts`
  - `packages/shared/src/mock/service.ts`
  - `packages/shared/test/places-marker-contract.spec.ts`
  - `packages/shared/test/contracts.spec.ts`
  - related client/provider parity tests
- Affected API/provider paths:
  - `apps/api/src/providers/mock/index.ts`
  - `apps/api/src/providers/cloudbase/index.ts`
  - `apps/api/test/app.spec.ts`
  - `apps/api/test/cloudbase.spec.ts`
- Affected mobile UI:
  - `apps/mobile/src/pages/places/map.vue`
  - mobile places copy only if a fallback or accessibility label is needed
- Affected docs:
  - `docs/已实现API接口清单.md`
- No new service, external dependency, environment variable, authentication behavior, or admin workflow is introduced.
