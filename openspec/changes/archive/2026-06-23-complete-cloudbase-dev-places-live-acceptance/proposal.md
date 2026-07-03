## Why

The CloudBase dev API is deployed and public places read smoke proves the function is using the live provider, but the live `places` collection is still empty. This blocks the 2026-06-18 exit criteria because list, map, detail, admin update, gallery media, and draft visibility have not been accepted against real CloudBase dev data.

## What Changes

- Seed or import minimum CloudBase dev `places` data through backend-controlled admin/API paths, including:
  - at least one `published` place with valid coordinates for list, marker, and detail acceptance
  - at least one `draft` place for public visibility denial acceptance
  - imported volunteer draft records where feasible, preserving review metadata as non-public data
- Verify public CloudBase dev reads for:
  - `GET /api/places`
  - `GET /api/places/map-markers`
  - `GET /api/places/:id`
- Verify admin CloudBase dev create/update behavior and published update visibility through public reads.
- Verify gallery media behavior against CloudBase dev using real CloudBase file ids or document a scoped blocker when no displayable file asset is available.
- Produce append-only validation evidence and update sprint/deployment docs so the 6.18 status is based on live acceptance rather than mock data.
- No production CloudBase resources or production data are in scope.

## Capabilities

### New Capabilities

- `places-live-data-acceptance`: Covers minimum CloudBase dev live places data seeding/import, public/admin acceptance checks, gallery evidence, draft visibility, and documentation needed to prove Places no longer depends on mock-only data for the 6.18 gate.

### Modified Capabilities

- None. Existing public/admin Places contracts remain unchanged; this change adds a focused live-data acceptance capability.

## Impact

- Affected scripts and commands:
  - `scripts/places_volunteer_import.mjs`
  - CloudBase dev API smoke commands against `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Affected API paths:
  - `GET /api/places`
  - `GET /api/places/map-markers`
  - `GET /api/places/:id`
  - `GET /api/admin/places`
  - `POST /api/admin/places`
  - `PATCH /api/admin/places/:id`
- Affected CloudBase dev resources:
  - environment `cloud1-d7gxdk8t43bd639c0`
  - collection `places`
  - storage path `public/places/{place_id}/` if gallery media is verified with real files
- Affected docs and evidence:
  - `docs/plan.md`
  - `docs/cloudbase-dev-api-deployment.md`
  - `docs/week8-places-cloudbase-integration.md`
  - `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/`
