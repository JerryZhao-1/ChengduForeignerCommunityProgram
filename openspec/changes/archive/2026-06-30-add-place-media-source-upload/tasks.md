## 1. Shared Contracts And Data Model

- [x] 1.1 Add shared place external media schemas and public detail fields [#R1]
  - ACCEPT: Shared schemas/types define supported external place media references, including provider source `amap`, source place id, image URL, optional image title, and attribution metadata; `Place` can persist external gallery media and external cover attribution with backward-compatible defaults; `PlaceDetail` can expose external gallery media and external cover source metadata while list and marker schemas continue excluding all gallery/external detail fields.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared schema/contract tests prove valid Amap external media parses, unsupported sources fail validation, existing place fixtures remain valid through defaults, public detail includes the new fields, and list/marker schemas reject or omit external media fields.
    - BUNDLE (RUN #1): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0001**task-1.1**ref-R1\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 1.2 Add admin Amap media search contracts and path helpers [#R2]
  - ACCEPT: Shared contracts expose an admin-only Amap place media search request/response, path helper, and client method without duplicating DTOs in apps; the response includes normalized place metadata and image candidates suitable for cover/gallery selection.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: contract/client tests cover URL construction, request validation, response parsing with photo candidates, empty-photo candidates, and unsupported provider/source values.
    - BUNDLE (RUN #2): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0002**task-1.2**ref-R2\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 2. Backend Providers And Routes

- [x] 2.1 Implement backend Amap search proxy for external image candidates [#R3]
  - ACCEPT: `apps/api` provides an admin-protected Amap search route that reads provider credentials from environment variables, calls Amap WebService without exposing credentials, normalizes photo candidates, returns standard success/error envelopes, and fails independently from the existing Tencent search route.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API route tests cover authorized search with mocked upstream photos, no-photo candidates, missing Amap credentials, upstream non-200/status failure, invalid upstream payload, non-admin denial, and existing Tencent search regression.
    - BUNDLE (RUN #3): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0003**task-2.1**ref-R3\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 2.2 Persist external media selections through admin place create/update [#R4]
  - ACCEPT: Admin create/update accepts external gallery media and external cover source metadata through shared validation; selecting external media does not create `FileAsset` records, does not append to `gallery_file_ids`, and public detail returns source-attributed external media while public list/marker payloads remain bounded.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: mock provider, CloudBase provider, and route tests cover saving/removing external gallery media, saving an externally sourced cover, rejecting unsupported sources, preserving `gallery_file_ids`, returning public detail attribution, and excluding external fields from list/marker responses.
    - BUNDLE (RUN #4): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0004**task-2.2**ref-R4\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 2.3 Implement direct admin place gallery upload backend flow [#R5]
  - ACCEPT: A protected direct upload path lets admins upload an image for an existing place; the backend stores the file under the place gallery prefix, creates a completed active `FileAsset`, appends the new file id to the target place `gallery_file_ids`, preserves existing gallery order, supports local/mock and CloudBase live modes, and rejects non-admin, missing-place, oversized, unsupported-type, or missing-file requests without completed asset mutation.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-2.3__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API/provider tests cover successful direct upload, CloudBase storage adapter behavior with mocked SDK calls, file asset creation, place update ordering, public detail media resolution, non-admin denial, missing id, invalid file, and compatibility of existing `/files/upload-requests`, `/files/complete`, and `/files/private-url` tests.
    - BUNDLE (RUN #5): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0005**task-2.3**ref-R5\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 3. Admin Media Workflows

- [x] 3.1 Add Amap external image search and selection UI to the place editor [#R6]
  - ACCEPT: `apps/admin` place editor exposes Amap search alongside Tencent metadata search; admins can review image candidates, select one as external gallery media or as cover, see source/provider labels, remove external references separately from uploaded files, and avoid accidental overwrites of unrelated place fields.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-3.1__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify CLI: `pnpm --filter @community-map/admin typecheck` and affected shared/API tests for client contract usage.
    - Verify GUI: provide MCP-only runbook under `tests/gui_runbook_admin_amap_external_media.md` that starts Admin against mock/HTTP fixtures, searches Amap candidates, selects cover/gallery images, confirms source labels, removes an external image, and captures screenshots/states. Do not include executable browser automation scripts.
    - BUNDLE (RUN #6): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0006**task-3.1**ref-R6\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

- [x] 3.2 Replace manual gallery file registration with direct upload UI [#R7]
  - ACCEPT: The place editor no longer asks admins to type a gallery file name or use "登记/挂接" language; existing places show uploaded file ids/media separately from external media; selecting a local image performs direct upload, updates `gallery_file_ids`, refreshes the place, and blocks upload until the place has been saved.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-3.2__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify CLI: `pnpm --filter @community-map/admin typecheck`, affected API upload tests, and shared client tests pass.
    - Verify GUI: provide MCP-only runbook under `tests/gui_runbook_admin_direct_gallery_upload.md` that creates or edits a place, confirms unsaved-place upload blocking, uploads an image, confirms the uploaded media appears as owned/uploaded media, verifies external media remains separate, and captures screenshots/states. Do not include executable browser automation scripts.
    - BUNDLE (RUN #7): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0007**task-3.2**ref-R7\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

## 4. Public Detail Rendering

- [x] 4.1 Render owned and external media with attribution on mobile detail [#R8]
  - ACCEPT: `apps/mobile` place detail renders owned `gallery_media`, external gallery media, and externally sourced cover attribution in a coherent gallery/detail experience; external images display provider/source attribution, owned images are not mislabeled, broken external images use a TDesign-aligned fallback, and no raw URLs/file ids/source JSON appear as body text.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-4.1__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify CLI: `pnpm --filter @community-map/mobile typecheck` and affected shared/API tests for public detail payloads pass.
    - Verify GUI: provide MCP-only runbook under `tests/gui_runbook_mobile_external_media_detail.md` that opens a detail fixture with owned media only, external media only, mixed media, external cover attribution, and a broken external image fallback; capture screenshots/states for each. Do not include executable browser automation scripts.
    - BUNDLE (RUN #8): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0008**task-4.1**ref-R8\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

## 5. Documentation And Final Validation

- [x] 5.1 Update docs and run final OpenSpec validation [#R9]
  - ACCEPT: Documentation records Amap configuration, provider-image rights assumptions, external media attribution behavior, direct place-gallery upload behavior, API endpoints/contracts, and the distinction between external media references and owned `gallery_file_ids`; final validation confirms this change is apply-ready and does not regress existing places media boundaries.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-media-source-upload/run-<RUN4>__task-5.1__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `openspec validate add-place-media-source-upload --strict --no-interactive`, affected package typechecks, affected Vitest suites, and documentation path checks are captured with exit codes and logs.
    - BUNDLE (RUN #9): Worker bundle created. | VALIDATION_BUNDLE: auto_test_openspec/add-place-media-source-upload/run-0009**task-5.1**ref-R9\_\_20260630T044745Z/ | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A
