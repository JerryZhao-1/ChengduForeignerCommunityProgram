## 1. Volunteer Spreadsheet Import

- [x] 1.1 Build a deterministic parser for `docs/志愿者点位采集表.xlsx` [#R1]
  - ACCEPT: The parser reads the horizontal point-column spreadsheet, preserves all 19 usable point records, keeps the two `点位类型` rows as distinct source fields, trims obvious whitespace, and reports unsupported or missing values without silently publishing data.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: parser output includes 19 point records, preserves both category sources, and writes logs/assertions proving row count and key field extraction.

- [x] 1.2 Map volunteer records into draft place import inputs plus review metadata [#R2]
  - ACCEPT: Imported records map confirmed canonical fields into draft `place` inputs, keep review-only evidence out of public payloads, default to `status=draft`, and flag records needing category, coordinate, address, English copy, or media review.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: given the spreadsheet input, generated outputs validate against shared place input schemas where applicable, every imported record is non-public by default, and unsupported categories are recorded as review blockers.

- [x] 1.3 Add backend or admin import execution path for volunteer drafts [#R3]
  - ACCEPT: Authorized admin/import execution can create or seed the spreadsheet-derived draft records through the backend-controlled path, with deterministic source identity and without changing public visibility rules.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-1.3__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: run import-path tests and affected API/shared tests.
    - GUI runbook: verify imported drafts are visible for admin review but absent from public mobile list/map/detail until published.

## 2. Real Data Edge Cases

- [x] 2.1 Harden public list and detail behavior for no gallery, no tags, no recommendation, and missing address [#R4]
  - ACCEPT: Published places with missing optional gallery, tags, recommendation state, or partial address data return schema-valid public responses and render stable mobile list/detail UI without raw file ids, broken images, or placeholder copy.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-2.1__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: run relevant shared/API/mobile tests for edge-case payloads.
    - GUI runbook: capture mobile list and detail states for no gallery, no tags, no recommendation, and incomplete address.

- [x] 2.2 Harden map behavior for no markers and missing or unusable coordinates [#R5]
  - ACCEPT: Places without usable coordinates are excluded from map markers, empty marker responses show a stable map empty/guidance state, and marker selection still navigates to the matching detail id for valid markers.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-2.2__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: assert marker filtering and no-marker responses.
    - GUI runbook: capture map empty state, valid marker selection, selected summary, and detail jump.

- [x] 2.3 Verify full mobile places chain after imported/admin data changes [#R6]
  - ACCEPT: Mobile list, map, detail, category/tag filtering, recommended entry, navigation, favorite state, and share-ready behavior remain connected as one complete chain after admin/import data changes.
  - TEST: SCOPE: GUI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-2.3__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - GUI runbook: use MCP or approved GUI tooling to capture the complete places chain; run scripts must start services only and must not drive browser actions.

## 3. Backend And Admin Closure

- [x] 3.1 Add admin review indicators for imported and incomplete place records [#R7]
  - ACCEPT: Admin places management makes missing coordinates, missing gallery, missing tags, missing English/address fields, draft status, and imported-source review needs visible enough for operators to complete records before publication.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-3.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: run affected admin typecheck and payload/static checks.
    - GUI runbook: capture admin imported-draft review, completion, save, publish, and frontstage refresh evidence.

- [x] 3.2 Close CloudBase/Koa parity for places reads and admin mutations [#R8]
  - ACCEPT: Mock, Koa route, CloudBase handler, and CloudBase provider paths align for public list, map markers, detail, admin list, admin create/update, validation errors, permission errors, not found, draft visibility, marker filtering, and gallery fields.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-3.2__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API/CloudBase tests cover success, validation, permission, not-found, visibility, edge-case data, and provider parity assertions.

- [x] 3.3 Fix final validation blockers in affected scope [#R9]
  - ACCEPT: Known repository validation blockers that affect Week 8 closure, including the current lint failure in `scripts/generate_aidrun_figma_svg.js`, are fixed or explicitly scoped out with documented rationale.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-3.3__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `pnpm typecheck`, `pnpm test`, and `pnpm lint` results are captured with zero exit codes or explicit documented blockers.

## 4. CloudBase Dev Deployment And Acceptance

- [ ] 4.1 Deploy `community-map-api` as the formal CloudBase dev HTTP function [#R10]
  - ACCEPT: `community-map-api` in CloudBase `dev` is verified as the formal HTTP function entry for `apps/api/src/cloudbase.ts`, with required environment variables documented and no longer treated as an Event placeholder.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-4.1__ref-R10__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: capture deployment command output or documented deployment evidence.
    - GUI runbook: record CloudBase console/MCP evidence for function name, env id, status, runtime, and entry behavior.

- [x] 4.2 Create or confirm CloudBase HTTP access `/api` route only after function verification [#R11]
  - ACCEPT: The CloudBase HTTP access service `/api` route is created or confirmed only after task 4.1 succeeds; if function verification fails, route creation remains deferred and the blocker is recorded.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-4.2__ref-R11__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: capture route/API smoke checks where available.
    - GUI runbook: record HTTP access service route status, dev access domain, and deferred blocker if applicable.

- [ ] 4.3 Run CloudBase dev places acceptance for list, map, detail, admin create/update, and gallery media [#R12]
  - ACCEPT: CloudBase `dev` acceptance proves public list, map markers, detail, admin create/update, gallery media read, imported draft visibility, and published update visibility against the live dev environment.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-4.3__ref-R12__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - CLI checks: capture API smoke tests and CloudBase provider/live checks.
    - GUI runbook: capture mobile/admin evidence for live dev list, map, detail, admin update, and gallery rendering.

## 5. Documentation And Final Gate

- [x] 5.1 Update Week 8 docs, API docs, and plan status [#R13]
  - ACCEPT: Documentation records volunteer import behavior, CloudBase dev function and `/api` route status, real-data edge-case handling, current API status, known limitations, and any remaining Week 9-12 backend/deployment work.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-5.1__ref-R13__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: documentation paths exist, mention the actual Week 8 evidence, and do not claim production CloudBase completion.

- [x] 5.2 Run final Week 8 OpenSpec and project validation [#R14]
  - ACCEPT: The change passes strict OpenSpec validation, relevant validation bundles exist for all completed tasks, and final checks cover the affected shared, API, admin, mobile, import, and docs scope.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-week8-places-cloudbase-integration-and-volunteer-import/run-<RUN4>__task-5.2__ref-R14__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `openspec validate complete-week8-places-cloudbase-integration-and-volunteer-import --strict --no-interactive`, `pnpm typecheck`, `pnpm test`, and `pnpm lint` are captured with final success or documented environment-only blockers.
