## Context

Places are canonical admin-maintained records that drive public list, map marker, and detail surfaces. The repository already has shared create/update schemas, an admin create route, an admin update route, mock provider behavior, and CloudBase provider behavior for updates, but backend place maintenance does not yet define a complete lifecycle for deleting existing landmarks.

This change keeps the current single-community model, shared contract-first API shape, admin-only authorization, and public payload boundaries. It treats existing correct edit behavior as baseline and adds the missing delete behavior in the same layers: shared contracts, clients, Koa routes, CloudBase HTTP handler, provider interfaces, mock service, CloudBase provider, tests, and docs.

## Goals / Non-Goals

**Goals:**

- Keep `PATCH /admin/places/:id` as the stable partial edit API for existing places.
- Add `DELETE /admin/places/:id` as the stable admin backend delete API for existing places.
- Enforce the same `community_admin` / `system_admin` role checks for edit and delete.
- Persist edit and delete behavior consistently in local mock and CloudBase provider modes.
- Preserve standard success/error envelopes, including `404 NOT_FOUND` for missing place ids and no provider mutation after failed validation or authorization.
- Ensure deleted places are absent from admin list and public list, map marker, and detail reads.
- Document and test the backend contract without redesigning the Admin UI.

**Non-Goals:**

- Add a recycle bin, undo workflow, audit log, or soft-delete status.
- Add new public place payload fields or change public list/map/detail projection shapes.
- Introduce multi-community or tenant-scoped place deletion rules.
- Replace mock actor authorization with production authentication.
- Rework volunteer import, file asset cleanup, or gallery storage ownership.

## Decisions

1. Keep partial edits on `PATCH /admin/places/:id`.
   - Rationale: Existing shared schemas, routes, clients, docs, and Admin usage already use PATCH for place edits. It also matches the intended partial-update behavior where omitted fields remain unchanged.
   - Alternative considered: Add `PUT /admin/places/:id` for full replacement. Rejected because it would increase caller burden and create two edit semantics for the same backend object.

2. Add `DELETE /admin/places/:id` with a small success payload.
   - Rationale: The project uses response envelopes rather than bare empty responses, so delete should return a stable body such as `{ deleted_id }` inside the normal success envelope.
   - Alternative considered: Return `204 No Content`. Rejected because it would be the first endpoint to bypass the documented success envelope shape. Returning the full deleted `Place` was also rejected because callers should not treat a deleted record as current state.

3. Use hard delete for the place record.
   - Rationale: Current `PLACE_STATUSES` already models `draft`, `published`, and `offline`; adding a `deleted` status would alter the shared enum, public filtering assumptions, and admin list semantics for a feature that only needs removal. Hard delete also makes admin and public absence straightforward to test.
   - Alternative considered: Soft-delete by changing `status` to `offline` or adding `deleted`. Rejected because `offline` still represents an admin-visible maintained record, while a new `deleted` status would be a broader data model change.

4. Keep authorization and parsing in route/handler layers, with provider methods returning null for missing ids.
   - Rationale: Existing route patterns parse shared schemas, enforce role checks, call providers, and map `null` provider results to `404 NOT_FOUND`. Delete should follow that pattern for consistent envelopes and testability.
   - Alternative considered: Throw HTTP errors directly from providers. Rejected because it mixes persistence concerns with HTTP response policy.

5. Extend shared contract infrastructure to support DELETE.
   - Rationale: `defineContract` currently permits GET, POST, and PATCH. Adding DELETE keeps admin delete discoverable by the same contract, paths, and clients used by the rest of the API.
   - Alternative considered: Implement delete only in app-local clients/routes. Rejected because backend API shape must stay in `packages/shared`.

## Risks / Trade-offs

- [Risk] Hard delete removes a place immediately and cannot be undone through the product. -> Mitigation: Keep deletion admin-only, return not-found for repeat deletes, document that audit/undo is out of scope, and preserve existing `offline` status for non-destructive hiding.
- [Risk] CloudBase delete behavior may differ from mock behavior if document removal APIs return provider-specific results. -> Mitigation: Normalize provider methods to `Promise<{ deleted_id: string } | null>` or equivalent, and test both missing-id and successful deletion paths.
- [Risk] Deleting a place can leave related gallery file assets or volunteer import evidence orphaned. -> Mitigation: Do not cascade-delete files in this change; document file cleanup as out of scope and only remove the canonical place record.
- [Risk] Existing edit behavior may already be partly implemented, making implementation mostly verification. -> Mitigation: Retain correct code and focus tasks on shared contract completeness, tests, docs, and delete gaps.

## Migration Plan

No data migration is required. Deploy shared contract/client updates, API route/handler updates, provider updates, tests, and docs together. Rollback is standard code rollback; previously deleted live records would not be restored automatically, so operators should use `offline` when they need reversible hiding.

## Open Questions

- None. The proposal assumes hard deletion is acceptable for admin-managed landmarks and that reversible hiding continues to use the existing `offline` status.
