## Context

CloudBase dev environment `cloud1-d7gxdk8t43bd639c0` has an active `community-map-api` HTTP function and `/api` access route. Public read smoke already proves the function is using `API_PROVIDER=cloudbase`, `CLOUDBASE_PROVIDER_MODE=live`, and the dev env id, because live public places responses are empty while local mock data is non-empty.

The missing piece is data-backed acceptance. The `places` live collection has no documents, so public detail, marker population, admin create/update, gallery media, imported draft visibility, and published update visibility cannot yet be accepted. The repo already has the pieces needed for a focused acceptance run: `scripts/places_volunteer_import.mjs`, the admin places API, the live CloudBase places provider, and public places contracts.

## Goals / Non-Goals

**Goals:**

- Write minimum CloudBase dev places data through backend-controlled admin/API paths.
- Import or seed draft data without making volunteer records public by default.
- Publish at least one representative live place with valid coordinates.
- Verify public list, map marker, and detail endpoints against live CloudBase data.
- Verify admin update persistence and public visibility after publication.
- Verify draft data remains hidden from public list, map markers, and detail.
- Verify gallery media with real CloudBase file ids when available, or record a precise blocker if no live file asset exists.
- Update docs and validation evidence for the 6.18 gate.

**Non-Goals:**

- Do not write to production CloudBase.
- Do not change the Places public/admin API contracts.
- Do not add non-places live providers.
- Do not replace the dev mock actor mechanism with production authentication.
- Do not publish all imported volunteer spreadsheet records automatically.

## Decisions

### 1. Use backend admin APIs as the primary data write path

Live data should be created through `POST /api/admin/places` and updated through `PATCH /api/admin/places/:id`, using `x-mock-user-id: user_001` for the current dev admin role. This exercises the same validation, permission, schema, and provider path the Admin app uses.

Alternative considered: write directly to the CloudBase `places` collection. Direct writes would be faster but would bypass route validation and admin permission behavior, which are part of the 6.18 acceptance.

### 2. Import volunteer rows as draft evidence, then publish only a representative subset

The existing import script should seed the 19 volunteer records as `draft` records with `import_review` metadata preserved. For public acceptance, use either a newly created minimal published place or a carefully updated representative imported draft after required fields and coordinates are normalized.

Alternative considered: publish all imported records. That would violate the existing Week 8 decision that volunteer spreadsheet data is review intake, not publication-ready content.

### 3. Treat `source_import_id` as the import idempotency key

The live provider generates CloudBase-facing place ids on create, so the spreadsheet's stable `_id` cannot be the only live idempotency mechanism. The import script already discovers existing imported places through `import_review.source_import_id`; the acceptance run should rely on that source identity to avoid duplicate draft imports.

Alternative considered: force imported `_id` values into live CloudBase. That does not match the current live provider create behavior and would make acceptance depend on a provider implementation change.

### 4. Verify public behavior with API smoke before GUI evidence

The hard 6.18 gate is data/provider correctness. CLI/API smoke should verify the public list, marker, detail, draft invisibility, and admin update visibility before optional Mobile/Admin GUI evidence is captured.

Alternative considered: rely on Admin/Mobile screens first. UI evidence is useful, but without API assertions it is harder to distinguish live provider behavior from cached or mock data.

### 5. Keep gallery acceptance honest

Gallery acceptance should use CloudBase `gallery_file_ids` that resolve through `getTempFileURL`. If a real public CloudBase file is not available during this run, the blocker must be documented with the exact missing resource and follow-up action. Hardcoded external `gallery_urls` can support non-gallery smoke but must not be used to claim CloudBase media acceptance.

Alternative considered: enter a public HTTPS URL into `gallery_urls` and count detail rendering as gallery acceptance. That proves detail fallback rendering, not CloudBase storage/media flow.

## Risks / Trade-offs

- [Risk] Seeding dev data can create duplicate imported drafts. -> Mitigation: use `import_review.source_import_id` idempotency and record created/updated ids in evidence.
- [Risk] Publishing an imported volunteer record before normalization can leak incomplete data. -> Mitigation: keep bulk import drafts unpublished and publish only a normalized representative record.
- [Risk] Current dev auth still relies on `x-mock-user-id`. -> Mitigation: scope this to CloudBase dev acceptance and do not claim production auth readiness.
- [Risk] Gallery file ids may not resolve if storage files are absent or permissions are wrong. -> Mitigation: separate gallery acceptance from list/map/detail/admin acceptance and record an explicit blocker if real file ids are unavailable.
- [Risk] Acceptance scripts could mutate live dev state unexpectedly. -> Mitigation: use deterministic names/source ids, record all ids touched, and provide cleanup notes.

## Migration Plan

1. Confirm CloudBase dev health and empty/non-empty current places state through `/api/health`, `/api/places`, and `/api/places/map-markers`.
2. Run the volunteer import script against the dev `/api` base URL to create or update draft imported places.
3. Create or update one minimal published acceptance place through `/api/admin/places`, with valid coordinates and safe bilingual fields.
4. Optionally attach a real CloudBase gallery file id if one is available; otherwise record the gallery-media blocker.
5. Verify public list, markers, and detail for the published place.
6. Verify a known draft imported place is hidden from public list, markers, and detail.
7. Patch the published place and re-read list/detail/markers to prove admin update visibility.
8. Update docs and validation bundle evidence with request ids, touched place ids, and remaining blockers.

Rollback for dev data is operational: delete or revert the acceptance records in CloudBase dev using the recorded ids/source ids. Production rollback is out of scope because production is not touched.

## Open Questions

- Is there already an approved public CloudBase storage file id that can be used for gallery acceptance, or should implementation create a small dev-only public fixture file?
- Should the representative published acceptance place be a normalized volunteer draft or a separate synthetic acceptance place with a clearly test-only name?
- Should cleanup remove acceptance records after evidence capture, or keep them as stable dev smoke data for the 6.24-6.30联调期?
