## Why

Admins need a reliable backend path to edit existing place records after initial intake, including corrections to bilingual content, map metadata, publication state, and recommendation fields. The current places flow already depends on admin-maintained data for public list, map marker, and detail surfaces, so the edit contract must be explicit and regression-tested before implementation work proceeds.

## What Changes

- Define the backend admin edit behavior for existing places through `PATCH /admin/places/:id`.
- Require shared request validation through `UpdatePlaceInputSchema`, using the same canonical place fields as create while allowing partial updates.
- Preserve admin authorization requirements and stable error envelopes for forbidden, invalid, and missing-place edits.
- Ensure successful edits are visible through admin reads and, when `status="published"`, through public list, map marker, and detail reads without leaking admin-only fields.
- Cover both local mock provider and CloudBase provider behavior where applicable.
- Add regression tests for successful edits, validation failures, missing ids, permission denial, and public visibility changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `places-admin-management`: Make editing existing place records an explicit backend admin management requirement, including validation, permissions, provider persistence, and downstream public visibility behavior.

## Impact

- `packages/shared/src/schemas/places.ts`
- `packages/shared/src/contracts/places.ts`
- `packages/shared/src/contracts/paths.ts`
- `packages/shared/src/client.ts`
- `apps/api/src/routes/places.ts`
- `apps/api/src/providers/types.ts`
- `apps/api/src/providers/mock/index.ts`
- `apps/api/src/providers/cloudbase/index.ts`
- `apps/api/src/cloudbase.ts`
- `apps/api/test/*`
- `packages/shared/test/*`
- `docs/已实现API接口清单.md`
- `docs/API接口使用手册.md`
