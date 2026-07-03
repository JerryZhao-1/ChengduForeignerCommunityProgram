## 1. Live Baseline And Draft Data

- [x] 1.1 Capture the current CloudBase dev places baseline [#R1]
  - ACCEPT: Current `/api/health`, `/api/places`, `/api/places/map-markers`, and `/api/admin/places` responses are captured against `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`, including status codes, response summaries, request ids when present, and whether existing live `places` data is empty or non-empty before mutation.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include baseline JSON summaries for health, public list, markers, and admin list; assertions confirm the CloudBase dev API is reachable and the baseline data state is explicitly recorded.

- [x] 1.2 Import volunteer spreadsheet records as CloudBase dev draft places [#R2]
  - ACCEPT: `scripts/places_volunteer_import.mjs` is executed against the CloudBase dev `/api` base URL with admin actor `user_001`; imported records are created or updated as `status="draft"` places; results record created/updated counts, returned ids, and `import_review.source_import_id` values; the execution does not publish all volunteer records.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include import execution JSON, imported draft count, created/updated actions, source import ids, and an assertion that imported records remain draft-only.

## 2. Published Live Places Acceptance

- [x] 2.1 Create or update a representative published CloudBase dev acceptance place [#R3]
  - ACCEPT: An authorized dev admin creates or updates one representative place through `/api/admin/places` with `status="published"`, valid coordinates, safe bilingual list/detail fields, controlled category, and deterministic acceptance naming or source metadata; the touched place id is recorded for later smoke checks and cleanup.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include create/update request and response summaries; assertions confirm the returned place is published, has valid coordinates, and is stored in the admin list.

- [x] 2.2 Verify public list, map markers, and detail for the published live place [#R4]
  - ACCEPT: Public `GET /api/places`, `GET /api/places/map-markers`, and `GET /api/places/:id` all return live CloudBase data for the published acceptance place; list and marker payloads remain limited to their public contract fields; detail includes navigation/share fields and does not expose `import_review`.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include public list, marker, and detail JSON summaries; assertions confirm the published place is present in all required public reads and forbidden fields are absent from list/marker/detail as applicable.

- [x] 2.3 Verify CloudBase dev draft visibility denial [#R5]
  - ACCEPT: At least one known draft imported or seeded place is visible through `/api/admin/places` but absent from public list and map marker responses; public `GET /api/places/:id` for that draft returns a stable not-found error envelope without leaking detail or review metadata.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-2.3__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include admin draft evidence and public denial responses; assertions confirm draft id absence from public list/markers and 404 semantics for public detail.

## 3. Admin Update And Gallery Media

- [x] 3.1 Verify admin update visibility through public live reads [#R6]
  - ACCEPT: The published acceptance place is updated through `/api/admin/places/:id`; subsequent public list, marker, and detail reads return the updated public fields while preserving public payload boundaries.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-3.1__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include patch request/response and before/after public reads; assertions confirm updated fields are reflected through public endpoints.

- [x] 3.2 Verify CloudBase gallery media resolution or record a scoped blocker [#R7]
  - ACCEPT: If a real public CloudBase gallery file id is available, attach it to the published acceptance place and verify detail returns `gallery_media` with displayable temporary URLs and derived `gallery_urls`; if no usable file id is available, record the exact missing resource or permission blocker and do not mark gallery media acceptance complete.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-3.2__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include either successful gallery detail JSON with resolved media URLs or a blocker file naming the missing CloudBase file/storage/permission prerequisite; assertions must distinguish success from documented blocker.

## 4. Documentation And Final Gate

- [x] 4.1 Update plan and deployment evidence docs with live acceptance status [#R8]
  - ACCEPT: `docs/plan.md`, `docs/cloudbase-dev-api-deployment.md`, and `docs/week8-places-cloudbase-integration.md` record the actual CloudBase dev places live data status, touched place ids or source ids, completed public/admin acceptance checks, gallery result or blocker, and remaining follow-up work without claiming production readiness.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-4.1__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include documentation grep/assertions proving docs mention the live acceptance date, dev env id, API domain, completed checks, and any remaining blockers.

- [x] 4.2 Run final OpenSpec and project validation for the acceptance scope [#R9]
  - ACCEPT: The change passes strict OpenSpec validation; relevant project checks for the affected scope are run or explicitly scoped with documented blockers; validation bundles exist for completed tasks; existing generated CloudBase bundle lint behavior is either fixed or documented if it remains outside this task's scope.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-cloudbase-dev-places-live-acceptance/run-<RUN4>__task-4.2__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: bundle outputs include `openspec validate complete-cloudbase-dev-places-live-acceptance --strict --no-interactive`, relevant `pnpm test`/`pnpm typecheck` output for the touched scope, and any lint result or documented lint blocker with exact path and reason.
