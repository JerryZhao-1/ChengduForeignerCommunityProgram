## 1. Shared Contracts and Media Resolution

- [x] 1.1 Add structured gallery media to the shared place detail contract [#R1]
  - ACCEPT: `PlaceDetail` includes `gallery_media` entries with displayable URL and file traceability fields; `gallery_urls` remains only as a derived compatibility field; list and marker schemas still exclude detail media.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`.
    - Run shared contract/schema tests that prove detail accepts `gallery_media`, `gallery_urls` is compatible, and list/marker payloads do not expose media.

- [x] 1.2 Resolve place detail media from registered file assets in shared mock behavior [#R2]
  - ACCEPT: mock seed data includes active public place gallery `FileAsset` records matching published place `gallery_file_ids`; mock place detail resolves `gallery_media` and derived `gallery_urls` from those file assets instead of independent manual URL text.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`.
    - Run mock/client tests proving a published sample place detail returns image URLs through `gallery_media` and does not require hand-entered `gallery_urls`.

## 2. API and Admin Media Flow

- [x] 2.1 Update API providers and handlers for media-backed place detail [#R3]
  - ACCEPT: Koa route, mock provider, provider types, HTTP client, and CloudBase handler stay aligned on the updated `PlaceDetail` shape; public list/map field boundaries and unpublished visibility behavior are unchanged.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`.
    - Run affected API route tests for place detail success, no-gallery detail, unpublished not-found, list field boundary, and marker field boundary.

- [x] 2.2 Replace admin gallery URL text with files-flow gallery attachment [#R4]
  - ACCEPT: Admin places management no longer builds payloads from comma-separated gallery URL text; gallery attachment uses upload request, complete file asset, and place update with `gallery_file_ids`; protected admin routes still require admin role.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`.
    - CLI portion runs admin typecheck and API permission/validation tests; GUI runbook verifies the places form exposes file-backed gallery attachment instead of manual URL text.

## 3. Mobile Places Experience

- [x] 3.1 Rebuild the mobile places detail page around real detail payload media [#R5]
  - ACCEPT: detail page renders gallery and cover media as images, shows hours, address, bilingual intro, tags, recommendation state, navigation, map-position, favorite placeholder, and share placeholder; gallery URLs, cloud paths, and file ids are not displayed as plain body text.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`.
    - CLI portion runs mobile typecheck; GUI runbook verifies detail with gallery, detail without gallery, native navigation action, and absence of raw gallery URL text.

- [x] 3.2 Align the mobile places module with TDesign MiniProgram conventions [#R6]
  - ACCEPT: `places` list, detail, map, and recommended entry surfaces use TDesign components, TDesign-compatible wrappers, or TDesign-aligned styling for buttons, tags, list rows, loading, empty, error, toast/feedback, and action states without adding another UI library.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`.
    - CLI portion runs mobile typecheck and mp-weixin build when feasible; GUI runbook captures list, map, detail, recommended, loading, empty, and error state screenshots.

## 4. Documentation and Verification

- [x] 4.1 Update API/UI documentation for media-backed place detail [#R7]
  - ACCEPT: implemented API docs and UI guidance describe `gallery_media`, derived `gallery_urls`, files-flow gallery attachment, and the Week 5 TDesign places-module coverage; docs note that live CloudBase files provider work remains deferred.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`.
    - Run a documentation consistency check by comparing docs references against shared contract names and affected route paths.

- [x] 4.2 Run final Week 5 validation and record evidence [#R8]
  - ACCEPT: affected shared/API tests, admin/mobile typechecks, lint where relevant, OpenSpec strict validation, and manual/MCP evidence for image rendering all pass or have documented blockers.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under `auto_test_openspec/complete-week5-places-detail-media/<run-folder>/`.
    - `run-folder` MUST be `run-<RUN4>__task-4.2__ref-R8__<YYYYMMDDThhmmssZ>/`.
    - Run `openspec validate complete-week5-places-detail-media --strict --no-interactive`, affected Vitest suites, admin/mobile typechecks, and MCP-driven GUI checks proving real image rendering and no plain gallery URL display.
