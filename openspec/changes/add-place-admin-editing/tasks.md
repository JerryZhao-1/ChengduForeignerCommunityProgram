## 1. Shared Contract And Routing

- [ ] 1.1 Finalize the shared admin place update contract [#R1]
  - ACCEPT: `UpdatePlaceInputSchema`, `placeContracts.adminUpdate`, `apiPaths.admin.updatePlace`, and the shared client expose a partial update contract for existing places; omitted fields are treated as unchanged by callers; any existing correct implementation is retained and documented by tests.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared contract and client tests prove `PATCH /admin/places/:id` uses `UpdatePlaceInputSchema`, accepts valid partial payloads, rejects invalid place fields, and keeps generated contract snapshots current.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [ ] 1.2 Harden admin PATCH route and CloudBase HTTP handler behavior [#R2]
  - ACCEPT: Koa and CloudBase HTTP entrypoints protect `PATCH /admin/places/:id` with admin role checks, parse requests through the shared update schema, return standard success envelopes, return `404 NOT_FOUND` for missing place ids, and return validation or permission error envelopes without provider mutation.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API route tests and CloudBase handler tests cover authorized edit, invalid payload, missing id, non-admin caller, and `/api`-prefixed CloudBase routing where applicable.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 2. Provider Persistence

- [ ] 2.1 Align mock provider partial update semantics [#R3]
  - ACCEPT: The mock provider updates only provided fields for an existing place, preserves `_id`, `community_id`, and omitted canonical fields, supports intentional replacement of nullable fields and arrays, returns `null` for missing ids, and does not mutate records after validation failures.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: mock service/provider tests update bilingual content, location, Tencent POI id, recommendation fields, gallery fields, and status while asserting omitted fields remain unchanged and failed edits leave the prior record intact.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [ ] 2.2 Align CloudBase provider update persistence [#R4]
  - ACCEPT: In live CloudBase provider mode, an admin place edit loads the existing document, validates the merged result with `PlaceSchema`, persists only defined changed fields, keeps the original document id, returns the updated canonical place, and does not create a duplicate document.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: CloudBase provider or handler tests prove edit persistence, no duplicate creation, schema validation before persistence, missing-id behavior, and parity with the mock provider response shape.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 3. Visibility, Regression Tests, And Docs

- [ ] 3.1 Add backend regression coverage for edited place visibility [#R5]
  - ACCEPT: Tests prove that editing a place to `published` updates admin reads and the public list, map marker, and detail surfaces with only contract-allowed fields; editing a place to `draft` keeps it visible to admins while hiding it from public list, map marker, and detail reads.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: affected API tests assert published edit propagation, draft hiding, marker-safe payload boundaries, absence of admin-only metadata from public responses, and stable envelope shape.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [ ] 3.2 Update API documentation and run final validation [#R6]
  - ACCEPT: API documentation records the admin place edit endpoint, request body semantics, authorization requirement, common error responses, and public visibility effects; OpenSpec strict validation and affected TypeScript/Vitest checks pass or any environment-only blocker is recorded.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-place-admin-editing/run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `openspec validate add-place-admin-editing --strict --no-interactive`, affected package typechecks, affected Vitest suites, and documentation path checks are captured with exit codes and logs.
    - BUNDLE (RUN #n): Pending implementation. | VALIDATION_BUNDLE: TBD | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #n): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A
