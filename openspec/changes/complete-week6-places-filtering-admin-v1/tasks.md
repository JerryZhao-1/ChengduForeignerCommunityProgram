## 1. Shared Contracts And Query Semantics

- [x] 1.1 Add `tag` to the v1 public places list query contract [#R1]
  - ACCEPT: `packages/shared` parses optional `tag` alongside page, pageSize, communityId, keyword, category, recommended, and sort; client typings expose the same input without changing list, marker, or detail response shapes.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: shared contract/client tests prove `tag` query parsing and confirm list/marker/detail payload boundaries remain unchanged

- [x] 1.2 Keep shared category taxonomy as the mobile/admin filter truth [#R2]
  - ACCEPT: mobile places filtering uses values derived from `PLACE_TOP_LEVEL_CATEGORIES` or an explicit mapping to those values; no mobile-only unsupported category value is sent to `GET /places`.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: static/typecheck or focused tests confirm category filter options resolve to supported shared taxonomy values

## 2. Places Backend

- [x] 2.1 Implement aligned public list tag filtering across provider paths [#R3]
  - ACCEPT: mock service, Koa route path, CloudBase handler, and CloudBase provider apply `tag` as an AND filter against `tag_ids`, composed with category, recommended, keyword, sort, pagination, community, and published visibility rules.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: API and CloudBase tests cover `GET /places?tag=<tag-id>`, `category + tag + recommended`, empty tag results, invalid sort, and list field boundaries

- [x] 2.2 Preserve recommendation query and published visibility behavior while adding tag support [#R4]
  - ACCEPT: `recommended=true` still returns only recommended published places, category/tag filters compose with recommended queries, and unpublished places remain hidden from list, marker, and detail surfaces.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: route/provider tests assert recommended-only results, composed filtering, unpublished exclusion, and deterministic sort behavior

## 3. Mobile Places Filtering And Recommended Entry

- [x] 3.1 Complete mobile list category, tag, keyword, and recommended filter flows [#R5]
  - ACCEPT: `apps/mobile/src/pages/places/index.vue` reads `keyword`, `category`, `tag`, `recommended`, and `sort` from route query; users can apply category and tag filters; active filters are visible enough to reset; place cards still navigate to detail.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI portion runs mobile typecheck; GUI MCP runbook verifies category filter, tag filter, keyword search, reset, and card-to-detail navigation

- [x] 3.2 Keep recommended places as a filtered list entry flow [#R6]
  - ACCEPT: recommended entry points route to `/pages/places/index?recommended=true&sort=recommended`; legacy recommended page remains a redirect shim and does not become a second data truth.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI/static checks confirm route generation; GUI MCP runbook verifies recommended entry opens a recommended-filtered list and results still open detail pages

## 4. Admin Places V1 And Gallery Attachment

- [x] 4.1 Complete admin places v1 create/edit metadata maintenance [#R7]
  - ACCEPT: authorized admin users can create and edit places with bilingual intro, category, tags, recommendation state/reasons/rank, status, coordinates, optional Tencent POI reference, navigation/favorite/share flags, and public visibility follows `status`.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI route tests cover admin create/update and public visibility; GUI MCP runbook verifies admin form fields and save/edit behavior

- [x] 4.2 Attach place gallery media through the backend files flow [#R8]
  - ACCEPT: admin place gallery attachment uses upload request, file completion, and place update with `gallery_file_ids`; unauthorized actors cannot register or attach protected place gallery files; manually entered gallery URL text is not required.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-4.2__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI tests cover files permission paths and attachment persistence; GUI MCP runbook verifies the admin gallery attachment control uses file registration rather than manual URL text

- [x] 4.3 Verify attached gallery files resolve to mobile-displayable detail media [#R9]
  - ACCEPT: after a gallery file is registered or attached to a published place, `GET /places/:id` returns `gallery_media` entries with displayable URLs and derived `gallery_urls`; mobile detail renders image components and does not show raw file ids/cloud paths as body text.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-4.3__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI API/CloudBase tests assert detail media resolution; GUI MCP runbook captures mobile detail with gallery media rendered as images

## 5. Documentation And Verification

- [x] 5.1 Update implemented API and plan-facing docs for Week 6 query/media behavior [#R10]
  - ACCEPT: docs record `tag` query support, recommended list filtering, admin places v1 maintenance scope, and file-backed gallery attachment; docs do not claim CloudBase prod or non-places live providers are complete.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-5.1__ref-R10__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: documentation consistency checks or focused review confirm query names and route paths match shared contracts and API code

- [x] 5.2 Run final Week 6 validation and record evidence [#R11]
  - ACCEPT: affected shared tests, API tests, CloudBase handler/provider tests, admin/mobile typechecks, OpenSpec strict validation, and MCP GUI checks for mobile/admin Week 6 flows are complete or have explicit documented blockers.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-5.2__ref-R11__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/complete-week6-places-filtering-admin-v1/<run-folder>/run.sh` or `run.bat`
    - Verify: run `openspec validate complete-week6-places-filtering-admin-v1 --strict --no-interactive`, affected Vitest suites, admin/mobile typechecks, and MCP-driven GUI checks; if full lint is blocked by unrelated existing script errors, record the blocker with exact file and rule names
