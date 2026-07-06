## 1. Shared Contracts And Admin API Surface

- [x] 1.1 Add shared admin event management contracts [#R1]
  - ACCEPT: Shared schemas/types/contracts expose `GET /admin/events` as `admin.listEvents()` returning admin event list items with canonical event fields plus active registration count, confirmed attendee count, remaining capacity, and `is_full`; expose `GET /admin/events/:id/registrations` as `admin.listEventRegistrations(eventId)` returning registration rows with linked ticket state; existing public event paths and schemas remain unchanged.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared contract/client tests prove admin paths exist, response schemas include required management fields, public event client methods are unchanged, and invalid registration/admin payload fixtures are rejected.
    - BUNDLE (RUN #1): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0001__task-1.1__ref-R1__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 1.2 Implement admin event routes and CloudBase handler parity [#R2]
  - ACCEPT: Koa routes and CloudBase compatibility handler support `GET /admin/events` and `GET /admin/events/:id/registrations`, enforce `community_admin` or `system_admin`, use standard success/error envelopes, return `404 NOT_FOUND` for missing event registration lists, and preserve existing create/update/review/check-in behavior.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API tests cover authorized admin list, non-admin denial, missing event registration list, `/api`-prefixed CloudBase routing where applicable, and stable envelope shape.
    - BUNDLE (RUN #2): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0002__task-1.2__ref-R2__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 2. Provider And Business Behavior

- [x] 2.1 Add mock provider admin event list and registration listing behavior [#R3]
  - ACCEPT: `createMockService` and mock provider expose `events.listAdmin()` and `events.listRegistrationsForAdmin(eventId)`; admin list includes draft, pending, approved, published, offline, and ended records; derived counts ignore cancelled/closed registrations; registration rows include ticket id, ticket code, ticket status, and used time when present.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: mock service/provider tests assert admin list sees hidden drafts, public list hides drafts, counts/full state are correct, registration rows join ticket state, and missing ids return `null` or mapped not-found behavior without mutation.
    - BUNDLE (RUN #3): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0003__task-2.1__ref-R3__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 2.2 Preserve public visibility and registration semantics while adding admin workflows [#R4]
  - ACCEPT: Public `GET /events` and `GET /events/:id` still expose only approved/published launch-visible events; admin-created drafts are absent from public reads until published; taking a published event offline hides it publicly; republishing makes it public again; signup before `start_time` remains allowed when the event is published and before `signup_deadline`.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: integration tests cover create draft admin-visible/public-hidden, approve publish public-visible, offline public-hidden, republish public-visible, and registration guard behavior including duplicate/full/ended/deadline conflicts.
    - BUNDLE (RUN #4): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0004__task-2.2__ref-R4__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 3. Admin Events Management UI

- [x] 3.1 Replace Events skeleton list with admin-backed table and filters [#R5]
  - ACCEPT: `EventsPage.vue` loads from `adminApi.admin.listEvents()`; the table displays bilingual title, review status, publish status, event time, signup deadline, capacity, current registration count, and full state; filters support review status, publish status, keyword, drafts-only, and published-only; loading, empty, and failure states are visible.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start the API/Admin services only.
    - Verify: CLI typecheck passes; GUI MCP runbook under `tests/` opens `/events`, confirms draft and published rows appear for admin, exercises filters, and records screenshots for table, loading/empty where practical, and no blocking console errors.
    - BUNDLE (RUN #5): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0005__task-3.1__ref-R5__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

- [x] 3.2 Add create/edit event dialog with canonical fields [#R6]
  - ACCEPT: Admin can open a create dialog and an edit dialog; the form includes bilingual title, summary, content, address, latitude, longitude, start time, end time, signup deadline, capacity, cover URL or file fields, review status, and publish status; saving valid input calls shared admin client methods; validation/API errors keep the dialog open and display an error.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start services only.
    - Verify: CLI component/type checks pass; GUI MCP runbook creates a draft, confirms it appears in the admin table, edits a title/capacity/date field, confirms changes persist after refresh, and verifies invalid input displays an error without closing the dialog.
    - BUNDLE (RUN #6): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0006__task-3.2__ref-R6__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

- [x] 3.3 Add status actions with visible feedback and safe pending states [#R7]
  - ACCEPT: Row actions include edit, save draft/create, submit or approve-and-publish, take offline, and republish where state-appropriate; each action disables repeated clicks while pending, shows `ElMessage.success` on success, shows `ElMessage.error` on failure, refreshes the table on success, and never appears to do nothing.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-3.3__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start services only.
    - Verify: API tests cover state transitions; GUI MCP runbook publishes a draft, confirms success message and mobile public visibility, takes it offline and confirms public hidden state, republishes it and confirms visibility returns.
    - BUNDLE (RUN #7): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0007__task-3.3__ref-R7__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

## 4. Registration Inspection And Check-In

- [x] 4.1 Add admin registration drawer/detail workflow [#R8]
  - ACCEPT: Admin can open an event's registration drawer or detail panel from the Events table; the panel loads `admin.listEventRegistrations(eventId)`, displays contact name, contact phone, attendee count, registration status, source channel, ticket id/code/status, and used time; loading, empty, and error states are explicit.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-4.1__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start services only.
    - Verify: CLI API tests cover registration listing; GUI MCP runbook opens a known event, confirms populated registration rows and ticket state, then opens an event without registrations and confirms empty state.
    - BUNDLE (RUN #8): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0008__task-4.1__ref-R8__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

- [x] 4.2 Add admin check-in form and error handling [#R9]
  - ACCEPT: Registration drawer or detail panel includes a check-in input/action for ticket id as the canonical value; successful check-in marks the ticket `used`, records `used_at`, refreshes the registration list, and shows success; missing, wrong-event, or already-used tickets show clear errors and do not mutate unrelated tickets.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-4.2__ref-R9__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start services only.
    - Verify: API tests cover valid check-in, wrong-event ticket, already-used ticket, missing ticket, and non-admin denial; GUI MCP runbook performs one successful check-in and one repeated check-in error with screenshots/console evidence.
    - BUNDLE (RUN #9): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0009__task-4.2__ref-R9__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

## 5. Documentation And Final Validation

- [x] 5.1 Update event API and operator documentation [#R10]
  - ACCEPT: `docs/已实现API接口清单.md` and `docs/API接口使用手册.md` document `GET /admin/events`, `GET /admin/events/:id/registrations`, admin event state actions, authorization requirements, request/response shape, common errors, and manual admin/mobile smoke expectations; docs explicitly note that registration export is deferred.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-5.1__ref-R10__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: documentation path checks and grep assertions prove new endpoints and deferred export note are present; docs examples use the current envelope and mock actor conventions.
    - BUNDLE (RUN #10): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0010__task-5.1__ref-R10__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 5.2 Run final CLI and browser/mobile smoke validation [#R11]
  - ACCEPT: Final validation covers OpenSpec strict validation, full TypeScript typecheck, full Vitest suite, lint, Admin browser smoke for create/edit/publish/offline/registration/check-in, and Mobile H5 or WeChat Mini Program smoke proving published events appear and offline events disappear.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-5.2__ref-R11__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to execute CLI checks and start services for GUI checks.
    - Verify: capture exit codes/logs for `openspec validate complete-events-admin-backoffice-integration --strict --no-interactive`, `corepack pnpm test`, `corepack pnpm lint`, `corepack pnpm typecheck`, plus GUI MCP evidence for Admin and mobile smoke routes.
    - BUNDLE (RUN #11): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/complete-events-admin-backoffice-integration/run-0011__task-5.2__ref-R11__20260703T100213Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: TBD

## 6. Activity Creation Usability

- [ ] 6.1 Add direct event cover upload contracts and providers [#R12]
  - ACCEPT: Shared schemas, paths, contracts, clients, provider interfaces, Koa routes, mock provider, and CloudBase live provider support `POST /admin/events/cover-file` and `POST /admin/events/:id/cover-file`; responses include `file_asset`, `cover_file_id`, `cover_cloud_path`, and `cover_url`; event DTO fields remain unchanged; non-admin, missing event, missing file, unsupported type, and oversize image errors use the standard envelope.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-6.1__ref-R12__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared client/contract tests prove FormData serialization and response schemas; API tests prove authorized upload, forbidden upload, missing target, invalid file, pending cover creation, save-on-submit binding, and public event `cover_url` behavior.

- [ ] 6.2 Improve Admin event create/edit form usability [#R13]
  - ACCEPT: `EventsPage.vue` uses an Element Plus top-label form with sections for basic info, cover, address, time/capacity, status, and body; cover uses local image upload and preview while hiding `cover_file_id`, `cover_cloud_path`, and `cover_url`; address search reuses the Tencent POI proxy and fills address/latitude/longitude; time fields use side-by-side datetime pickers labeled start/end/signup deadline with Chengdu UTC+8; capacity is labeled as attendee limit with explanatory text.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-6.2__ref-R13__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to start services only.
    - Verify: Admin typecheck passes; GUI MCP runbook opens `/events`, creates an event with uploaded cover, fills location from search, edits time/capacity, saves, and confirms no visible technical cover fields or blocking console errors.

- [ ] 6.3 Update API and operator documentation for event cover upload [#R14]
  - ACCEPT: API usage docs, implemented endpoint inventory, and OpenAPI document describe event cover upload endpoints, multipart `file` field, image limits, authorization, response shape, save-on-submit semantics, Tencent POI proxy behavior, and API-side map key configuration.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-6.3__ref-R14__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: grep assertions prove docs include `/admin/events/cover-file`, `/admin/events/:id/cover-file`, `event_cover`, multipart constraints, and Tencent Map API-side configuration notes.

- [ ] 6.4 Run final regression validation for activity creation usability [#R15]
  - ACCEPT: Final validation covers OpenSpec strict validation, full relevant TypeScript typechecks, Vitest suite, lint, and Admin browser smoke for create/edit with cover upload, POI fill, datetime picker labels, and attendee-limit copy.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/complete-events-admin-backoffice-integration/run-<RUN4>__task-6.4__ref-R15__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat` to execute CLI checks and start services for GUI checks.
    - Verify: capture exit codes/logs for `openspec validate complete-events-admin-backoffice-integration --strict --no-interactive`, `corepack pnpm test`, `corepack pnpm typecheck`, `corepack pnpm lint`, plus GUI evidence for Admin `/events` activity creation.
