## Context

The `places` module now has functional mobile list, map, detail, filter, recommendation, favorite, share-ready, navigation, and admin maintenance surfaces. The remaining Week 8 problem is integration quality: those surfaces must work together against CloudBase `dev`, and real volunteer collection data must enter the backend without bypassing review.

The volunteer spreadsheet at `docs/志愿者点位采集表.xlsx` contains 19 collected locations in a horizontal layout. It has useful names, categories, addresses, hours, and notes, but it does not consistently include coordinates, media file ids, collection provenance, Tencent POI ids, or review status. That makes the data suitable for draft/admin review intake, not direct public publication.

CloudBase Week 4 deployment notes already record the dev environment, function name, storage paths, indexes, and HTTP access domain. They also state that `community-map-api` was still an Event placeholder and that `/api` route creation was deferred until Week 8.

## Goals / Non-Goals

**Goals:**

- Import the volunteer spreadsheet into backend-controlled `places` data as drafts or an equivalent admin-review intake state.
- Preserve raw volunteer evidence and uncertain values for admin review without exposing them through public `places` list, marker, or detail payloads.
- Ensure imported records cannot appear publicly until required canonical fields and publication decisions are completed by an admin.
- Verify the complete `places` chain in CloudBase `dev`: list, map markers, detail, admin create/update, and gallery media read.
- Make real-data edge cases deliberate and tested: no gallery, no tags, no recommendation, no marker, and missing/incomplete address.
- Deploy `community-map-api` as the formal dev HTTP function before creating the CloudBase HTTP access `/api` route.
- Produce repeatable validation evidence under `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/`.

**Non-Goals:**

- Do not create or write to a CloudBase production environment.
- Do not make volunteer-submitted records public automatically.
- Do not add a persistent favorite backend contract in Week 8.
- Do not introduce a second UI library or a new independent backend outside the existing BFF/CloudBase path.
- Do not require volunteer spreadsheet fields to become public `PlaceSchema` fields if they are review-only evidence.

## Decisions

### 1. Import volunteer rows as drafts first

Imported spreadsheet records should become `status="draft"` canonical places or admin-review records that can be converted into draft places. Direct publication is rejected because the spreadsheet lacks consistent coordinates, provenance, media assets, and review-state fields.

Alternative considered: publish all imported records immediately so the map/list has more content. This would leak unreviewed names, incomplete English data, missing coordinates, and unsupported category values into public surfaces.

### 2. Keep canonical `place` public payloads stable

The import may require a parser, seed utility, admin review indicators, or internal review metadata, but public list, marker, and detail payloads must not grow to include volunteer evidence, phone numbers, cost notes, or raw collection notes. Public payload boundaries stay as already defined.

Alternative considered: add all spreadsheet columns to `PlaceSchema`. This would couple public data contracts to raw collection workflow and force mobile surfaces to handle fields that belong to operations review.

### 3. Preserve duplicate spreadsheet field meanings explicitly

The spreadsheet has two rows named `点位类型`: one contains volunteer-facing Chinese categories such as `餐饮` or `酒类`, while another sometimes contains internal category-like codes such as `food-drink`. The parser must keep both meanings, using a deterministic mapping priority and preserving the raw value for review.

Alternative considered: turn rows into objects by field name only. That would overwrite one row and lose review context.

### 4. Treat missing coordinates as valid draft data but not displayable marker data

A place can be imported without reliable coordinates, but public map markers must continue to require usable coordinates. Admin must be able to see which imported records need coordinate completion before publication or map acceptance.

Alternative considered: use a default Tongzilin coordinate for every imported record. This would create false markers and undermine navigation trust.

### 5. Gate `/api` route creation on real HTTP function deployment

The CloudBase HTTP access `/api` route should only be created after `community-map-api` is deployed as the formal HTTP function entry for `apps/api/src/cloudbase.ts`. If deployment cannot be verified, the route remains deferred and Week 8 evidence records the blocker.

Alternative considered: create `/api` immediately against the existing Event placeholder. That would make the route look complete while still routing to the wrong function behavior.

### 6. Use validation bundles for both CLI and GUI evidence

Every Week 8 task should produce append-only evidence under `auto_test_openspec`. CLI tasks run scripts/tests. GUI or deployment tasks provide MCP/runbook evidence and must not automate browser or CloudBase console actions through hidden scripts.

Alternative considered: rely on ad hoc screenshots and terminal history. That is not reproducible enough for the existing OpenSpec validation discipline.

## Risks / Trade-offs

- [Risk] The spreadsheet contains incomplete or ambiguous fields. -> Mitigation: import as draft/review data, keep admin-owned publication fields, and require admin completion before public visibility.
- [Risk] Some collected locations have no usable coordinates. -> Mitigation: keep marker endpoint filtering strict and surface missing-coordinate records in admin review.
- [Risk] Real CloudBase deployment may require credentials or console access not available during implementation. -> Mitigation: separate code readiness from deployment execution and require explicit Week 8 evidence or blocker notes.
- [Risk] Gallery media cannot be proven from spreadsheet text alone. -> Mitigation: verify gallery media through existing `gallery_file_ids` and CloudBase temporary file URL resolution, not through manually typed URLs.
- [Risk] Existing lint failure in `scripts/generate_aidrun_figma_svg.js` can block final Week 8 validation. -> Mitigation: include lint closure in final verification tasks.
- [Risk] Adding an import path could become a full CMS workflow. -> Mitigation: keep Week 8 scoped to deterministic spreadsheet parsing, draft/admin review intake, and evidence; defer a full volunteer submission product if needed.

## Migration Plan

1. Add or update import utilities and tests so the spreadsheet can be parsed into canonical draft `place` inputs plus review metadata.
2. Seed or import the 19 spreadsheet records into the chosen backend path in non-public draft/review state.
3. Use admin to complete a representative subset with coordinates, category normalization, media attachment, and publication state.
4. Deploy `community-map-api` to CloudBase `dev` as the formal HTTP function.
5. Create or confirm the CloudBase HTTP access `/api` route only after the function deployment is verified.
6. Run CloudBase `dev` acceptance for list, map markers, detail, admin create/update, and gallery media read.
7. Update docs with actual Week 8 deployment/import status and known limitations.

Rollback is straightforward for code changes through git. For CloudBase data, imported draft records should be identifiable by source metadata or deterministic import ids so they can be deleted or reverted without touching existing manually maintained places.

## Open Questions

- Should Week 8 store review-only spreadsheet metadata inside canonical draft places, a sidecar local import artifact, or a future `place_submissions` collection?
- Which imported records should be normalized and published during Week 8 acceptance, if any, versus kept entirely as draft evidence?
- Are there real gallery files already available for the 19 collected records, or should gallery media read acceptance use existing known CloudBase test files?
