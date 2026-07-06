## Context

Places are maintained by admins and consumed by public list, map marker, and detail surfaces. The current repository already defines a shared `UpdatePlaceInputSchema`, an admin update contract, and a `PATCH /admin/places/:id` backend route, but this change makes the backend editing behavior explicit enough to implement and regress safely across mock and CloudBase execution paths.

Admin edits operate on canonical `place` records, not volunteer raw submissions. The backend must preserve shared schema boundaries, single-community assumptions, admin-only authorization, and the public payload limits already defined for list, marker, and detail reads.

## Goals / Non-Goals

**Goals:**

- Provide a stable backend admin edit path for existing places.
- Allow partial updates using the shared update schema while preserving omitted fields.
- Persist edits in both the local mock provider and CloudBase provider path when live CloudBase mode is enabled.
- Return predictable success and error envelopes for valid edits, validation failures, missing place ids, and unauthorized callers.
- Ensure published edits propagate to public list, map marker, and detail reads without exposing admin-only fields.
- Add focused tests and documentation for the admin edit contract.

**Non-Goals:**

- Build or redesign the admin UI editing form.
- Introduce multi-community or tenant-scoped place management.
- Add new place fields outside the existing canonical `PlaceSchema` unless implementation discovers a contract gap.
- Change public `GET /places`, `GET /places/map-markers`, or `GET /places/:id` payload shapes beyond reflecting edited values.
- Replace the mock actor mechanism with production authentication.

## Decisions

1. Use `PATCH /admin/places/:id` as the edit API.
   - Rationale: The shared contract and route shape already use PATCH for partial admin updates, matching existing admin event updates.
   - Alternative considered: Add `PUT /admin/places/:id`. Rejected because full replacement would increase caller burden and conflict with existing partial update schema.

2. Validate request bodies with `UpdatePlaceInputSchema`.
   - Rationale: The update schema is derived from create input and keeps validation in `packages/shared`, where both API and clients can share it.
   - Alternative considered: Accept untyped partial records in the route and validate only in providers. Rejected because it would weaken envelope consistency and duplicate validation logic.

3. Merge only defined fields into the existing place.
   - Rationale: PATCH callers must be able to update one field without clearing omitted bilingual, navigation, gallery, recommendation, or publication fields.
   - Alternative considered: Apply raw body directly. Rejected because omitted fields or `undefined` values could corrupt existing canonical records.

4. Keep provider behavior aligned across mock and CloudBase paths.
   - Rationale: Local development and tests use the mock provider, while production direction is CloudBase. Both must preserve `_id`, `community_id`, validation semantics, and not create duplicate records on edit.
   - Alternative considered: Only implement mock behavior first. Rejected because backend place maintenance is a CloudBase-facing production workflow.

5. Reuse existing public read projection rules after edits.
   - Rationale: Public list and marker endpoints must remain bounded projections. Edits should change allowed public values but must not leak admin-only fields such as `import_review` or gallery ownership ids.
   - Alternative considered: Return admin records directly to public consumers after edit. Rejected because it violates existing public contract boundaries.

## Risks / Trade-offs

- [Risk] Existing code already implements portions of this change, so implementation may be mostly verification and cleanup. -> Mitigation: Treat existing code as baseline, keep useful behavior, and focus tasks on closing measurable gaps.
- [Risk] CloudBase document updates may persist invalid partial state if validation is bypassed. -> Mitigation: parse the merged record with `PlaceSchema` before provider persistence and add provider-level regression tests.
- [Risk] Public surfaces may appear stale if tests only inspect admin reads. -> Mitigation: include public list, marker, and detail assertions after a published edit.
- [Risk] Partial updates could unintentionally erase nullable fields or arrays. -> Mitigation: distinguish omitted fields from explicit `null` or empty arrays and test both retained and intentional replacement behavior.

## Migration Plan

No data migration is expected. Deploy shared contract, API route/provider changes, tests, and docs together. Rollback is standard code rollback; existing place records remain compatible with the current `PlaceSchema`.

## Open Questions

- None. This change assumes the existing canonical place fields are sufficient for editing current admin-maintained landmarks.
