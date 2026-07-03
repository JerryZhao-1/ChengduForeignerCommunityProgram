## Why

Admins can already create place records and public surfaces depend on those maintained records, but backend place maintenance needs an explicit complete lifecycle for existing landmarks. Operators need reliable edit and delete paths for correcting data, removing wrong or obsolete landmarks, and keeping public list, map, and detail reads aligned with admin decisions.

## What Changes

- Keep `PATCH /admin/places/:id` as the backend admin edit API for partial updates to existing places.
- Add an admin-only backend delete API for existing places, exposed as `DELETE /admin/places/:id`.
- Require shared contract/path/client definitions for delete alongside the existing create and update contracts.
- Require Koa and CloudBase HTTP handlers to enforce `community_admin` or `system_admin` authorization for edit and delete.
- Require mock and CloudBase providers to persist edits and deletes consistently, returning stable not-found behavior for missing place ids.
- Ensure deleted places disappear from admin reads and from public list, map marker, and detail reads without changing public payload shapes.
- Add regression tests and API docs for successful edit/delete, missing ids, permission denial, validation failures for edit, and public visibility after delete.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `places-admin-management`: Extend backend place maintenance requirements to cover editing and deleting existing admin-managed place records.

## Impact

- `packages/shared/src/contracts/places.ts`
- `packages/shared/src/contracts/paths.ts`
- `packages/shared/src/client.ts`
- `packages/shared/src/mock/client.ts`
- `packages/shared/src/mock/service.ts`
- `apps/api/src/routes/places.ts`
- `apps/api/src/providers/types.ts`
- `apps/api/src/providers/mock/index.ts`
- `apps/api/src/providers/cloudbase/index.ts`
- `apps/api/src/cloudbase.ts`
- `apps/api/test/*`
- `packages/shared/test/*`
- `docs/API接口使用手册.md`
- `docs/已实现API接口清单.md`
- `docs/openapi/community-map-api.openapi.yaml`
