## Context

The Week 6 plan focuses on closing the `places` discovery and maintenance loop. The repository already has split places contracts, public list/detail/marker routes, mobile list/map/detail pages, a recommended-list redirect, admin place create/update fields, and file-backed gallery media foundations.

The remaining implementation risk is that the plan calls for category/tag filtering and admin gallery ownership through `file_assets`, while the current places list query surface only formalizes category/recommended filtering. The mobile category selector also needs to stay aligned with the shared top-level taxonomy so users do not send unsupported category values.

## Goals / Non-Goals

**Goals:**

- Add a single-value `tag` public list query input and keep it aligned across shared schemas, mock service, Koa routes, CloudBase handler, and CloudBase provider paths.
- Keep recommended places as a filtered list flow using the existing public list endpoint.
- Align mobile category filter options with the shared top-level places taxonomy and add a clear tag-filter entry/reset flow.
- Complete admin places v1 maintenance for bilingual intro, category, tags, recommendation metadata, coordinates, POI, status, and gallery file ids.
- Ensure admin gallery media is registered through the files flow and resolves to displayable `gallery_media` from public place detail.

**Non-Goals:**

- Persistent favorites or a full share backend.
- Multi-tag boolean query syntax, faceted counts, or full-text search ranking.
- CloudBase prod deployment, `/api` route creation, or non-places live CloudBase providers.
- Replacing the existing admin file registration flow with direct binary upload UI in this change.

## Decisions

1. Use `tag` as the v1 public query parameter for tag filtering.
   - Rationale: each place already stores `tag_ids`; a single-value `tag` parameter is enough for Week 6 and avoids defining multi-tag precedence.
   - Alternative considered: `tags=foo,bar`. This is deferred because it needs combination semantics and UI affordances that are not required for the Week 6 milestone.

2. Apply public filters with AND semantics.
   - Rationale: `category`, `tag`, `recommended`, `keyword`, pagination, and sort should compose predictably for list browsing.
   - Alternative considered: treating tag/category as OR. That would make recommended/category entry flows harder to reason about and less useful for admin verification.

3. Derive mobile category options from the shared top-level taxonomy.
   - Rationale: admin and public list filtering must use the same controlled category truth.
   - Alternative considered: maintaining a mobile-only friendly category list. That risks invalid query values and duplicated taxonomy work.

4. Keep recommended places as list filtering rather than a dedicated endpoint or page.
   - Rationale: this matches the existing v1 contract and avoids another data source for the same browsing surface.
   - Alternative considered: add `/places/recommended`. This is unnecessary while `GET /places?recommended=true&sort=recommended` covers the use case.

5. Keep gallery ownership file-backed.
   - Rationale: admin attaches completed `place_gallery` file assets by saving `gallery_file_ids`, and public detail resolves displayable URLs through `gallery_media`.
   - Alternative considered: manual gallery URL text. This was already moved out of the Week 5 media direction and should not return as v1 truth.

## Risks / Trade-offs

- [Risk] Single tag filtering may not cover future multi-tag discovery needs. → Mitigation: keep `tag` additive and do not prevent future `tags` or faceted APIs.
- [Risk] Shared taxonomy labels may be too raw for final mobile UX. → Mitigation: use shared values as the query truth; friendly labels can be layered without changing query values.
- [Risk] File registration proves ownership metadata but not real binary upload in every environment. → Mitigation: require route/provider tests for file asset completion and detail-media resolution, and leave live CloudBase storage acceptance for Week 8.
- [Risk] Existing lint may fail for unrelated script issues. → Mitigation: run targeted typecheck/test/OpenSpec validation for this change and document unrelated lint blockers if full lint remains blocked.
