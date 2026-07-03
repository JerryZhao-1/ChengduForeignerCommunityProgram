## 1. Contract and Provider Payload

- [x] 1.1 Add nullable `cover_url` to the marker contract and shared marker tests [#R1]
  - ACCEPT: `PlaceMapMarkerSchema` includes `cover_url: string | null`; marker parsing preserves `cover_url` while continuing to strip address, intro, gallery, external media, cover source, and navigation fields; shared marker and contract snapshots/tests reflect the new bounded payload.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: bundle runs focused shared tests, including `packages/shared/test/places-marker-contract.spec.ts` and `packages/shared/test/contracts.spec.ts`, and asserts the marker payload contains `cover_url` but not forbidden detail/media fields.

- [x] 1.2 Return marker `cover_url` consistently from mock and CloudBase provider paths [#R2]
  - ACCEPT: mock service, API mock provider, CloudBase HTTP function path, and CloudBase live provider all map `place.cover_url` into `places.mapMarkers()` responses; marker ordering, published visibility, community scoping, and invalid-coordinate filtering remain unchanged.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: bundle runs focused shared/API tests covering `mapMarkers()` parity and HTTP `GET /places/map-markers`; assertions check `cover_url` is present and forbidden detail/media fields remain absent.

## 2. Mobile Map Preview

- [x] 2.1 Show the selected marker cover preview on the mobile map page [#R3]
  - ACCEPT: tapping a map marker with non-null `cover_url` highlights the selected marker and shows its cover preview near the tapped marker location or in the nearest platform-stable map overlay position; the existing selected summary card, detail CTA, and navigation CTA continue to work from marker-safe data without fetching detail.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI portion runs `pnpm --filter @community-map/mobile typecheck`; GUI portion provides an MCP-only runbook under `tests/` to open the mobile H5 places map, tap a marker with cover data, capture screenshots, and assert the cover preview, selected summary, detail CTA, and navigation CTA remain visible and coherent.

- [x] 2.2 Handle null or failed cover images without breaking marker selection [#R4]
  - ACCEPT: tapping a marker with `cover_url: null` or a failed image load keeps marker selection, summary card, detail navigation, and native navigation behavior usable; no broken image placeholder is shown as the primary selected-marker affordance.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI portion runs mobile typecheck or focused component tests if added; GUI MCP runbook verifies a no-cover marker selection path and records screenshots showing no broken image placeholder and preserved detail navigation.

## 3. Documentation and Validation

- [x] 3.1 Update API documentation for marker cover previews [#R5]
  - ACCEPT: public API documentation lists `cover_url` as part of `GET /places/map-markers` marker payloads and explicitly states that marker payloads still exclude gallery arrays, external media arrays, cover source metadata, full address bodies, intro bodies, and navigation objects.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: bundle performs text assertions against `docs/已实现API接口清单.md` and any updated OpenAPI/API docs for marker `cover_url` and forbidden detail/media fields.

- [x] 3.2 Validate the completed OpenSpec change and focused regression suite [#R6]
  - ACCEPT: the change validates with OpenSpec strict mode; focused shared/API/mobile checks pass or any blocked GUI/mp-weixin evidence is recorded with exact blocker, platform, and follow-up owner.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-map-marker-cover-preview/<run-folder>/run.sh` or `run.bat`
    - Verify: bundle runs `openspec validate add-map-marker-cover-preview --strict --no-interactive`, focused shared/API tests, `pnpm --filter @community-map/mobile typecheck`, and includes an MCP-only GUI runbook for H5 and mp-weixin marker preview evidence where available.
