## 1. Shared Contract And Client

- [x] 1.1 Extend shared place admin contracts for delete [#R1]
  - ACCEPT: `defineContract` supports `DELETE`; `placeContracts.adminDelete`, `apiPaths.admin.deletePlace`, a shared delete response schema such as `{ deleted_id: string }`, and the shared HTTP client expose `DELETE /admin/places/:id` without app-local duplicate paths or DTOs.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared contract/client tests assert the DELETE method, `/admin/places/:id` path helper, response schema, and generated client call shape.
    - BUNDLE (RUN #1): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0001__task-1.1__ref-R1__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #1): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 1.2 Lock the shared partial edit contract [#R2]
  - ACCEPT: `UpdatePlaceInputSchema`, `placeContracts.adminUpdate`, `apiPaths.admin.updatePlace`, and shared clients continue to represent partial place edits; omitted fields are documented by tests as caller-preserved, and invalid place field values are rejected by shared schema tests.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: shared schema, contract, and client tests cover valid partial updates, invalid category/status/URL/coordinates, and unchanged existing update path snapshots.
    - BUNDLE (RUN #2): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0002__task-1.2__ref-R2__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #2): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 2. HTTP Entrypoints

- [x] 2.1 Harden Koa admin edit and delete routes [#R3]
  - ACCEPT: `apps/api/src/routes/places.ts` protects both `PATCH /admin/places/:id` and `DELETE /admin/places/:id` with `community_admin` / `system_admin`; PATCH parses `UpdatePlaceInputSchema`; DELETE returns a success envelope containing the deleted id; missing ids return `404 NOT_FOUND`; failed validation or authorization leaves provider state unchanged.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: API route tests cover authorized edit, invalid edit, missing edit id, unauthorized edit, authorized delete, missing delete id, unauthorized delete, and standard envelope/status codes.
    - BUNDLE (RUN #3): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0003__task-2.1__ref-R3__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #3): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 2.2 Add CloudBase HTTP handler parity for place delete [#R4]
  - ACCEPT: `apps/api/src/cloudbase.ts` handles `DELETE /admin/places/:id` with the same authorization, provider call, success envelope, and `404 NOT_FOUND` behavior as the Koa route; existing `/api`-prefixed CloudBase routing remains compatible for admin place create/update/list flows.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: CloudBase handler tests cover `/admin/places/:id` and `/api/admin/places/:id` DELETE requests, authorized and unauthorized callers, missing ids, and unchanged PATCH behavior.
    - BUNDLE (RUN #4): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0004__task-2.2__ref-R4__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #4): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 3. Provider Persistence

- [x] 3.1 Implement mock place edit and delete persistence semantics [#R5]
  - ACCEPT: The mock service/provider updates only defined PATCH fields, preserves `_id`, `community_id`, and omitted fields, intentionally replaces explicit nullable/array fields, deletes existing places by id, returns `null` for missing ids, and does not mutate records after validation, permission, or missing-id failures.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: mock service/provider tests cover update preservation, explicit replacement, successful delete, repeat/missing delete, and state immutability after failed operations.
    - BUNDLE (RUN #5): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0005__task-3.1__ref-R5__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #5): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 3.2 Implement CloudBase place edit and delete persistence semantics [#R6]
  - ACCEPT: The CloudBase provider loads existing documents before updates/deletes, validates merged PATCH records with `PlaceSchema`, persists only defined changed fields for PATCH, removes the matching document for DELETE, returns the normalized deleted id, returns `null` for missing ids, and does not create duplicate documents.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: CloudBase provider or handler tests prove update persistence, schema validation before persistence, no duplicate creation, successful delete, missing delete behavior, and response-shape parity with the mock provider.
    - BUNDLE (RUN #6): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0006__task-3.2__ref-R6__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #6): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

## 4. Visibility, Docs, And Final Validation

- [x] 4.1 Add backend regression coverage for edit and delete visibility [#R7]
  - ACCEPT: Tests prove that editing a place to `published` updates admin reads plus public list, map marker, and detail reads with only contract-allowed fields; editing a place to `draft` hides it from public reads; deleting a published place removes it from admin reads and makes public list, marker, and detail reads behave as missing.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: affected API and shared tests assert published edit propagation, draft hiding, delete absence, marker-safe payload boundaries, absence of admin-only metadata from public responses, and stable envelope shape.
    - BUNDLE (RUN #7): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0007__task-4.1__ref-R7__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #7): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A

- [x] 4.2 Update API docs and run final validation [#R8]
  - ACCEPT: API docs and OpenAPI list `PATCH /admin/places/:id` and `DELETE /admin/places/:id`, their authorization requirements, response bodies, validation/not-found/permission errors, and public visibility effects; strict OpenSpec validation and affected TypeScript/Vitest checks pass or any environment-only blocker is recorded.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-admin-place-edit-delete/run-<RUN4>__task-4.2__ref-R8__<YYYYMMDDThhmmssZ>/`
    - Run: `<run-folder>/run.sh` or `<run-folder>/run.bat`.
    - Verify: `openspec validate add-admin-place-edit-delete --strict --no-interactive`, affected package typechecks, affected Vitest suites, and documentation path checks are captured with exit codes and logs.
    - BUNDLE (RUN #8): Worker bundle ready. | VALIDATION_BUNDLE: auto_test_openspec/add-admin-place-edit-delete/run-0008__task-4.2__ref-R8__20260629T084500Z | HOW_TO_RUN: run.sh/run.bat
    - EVIDENCE (RUN #8): Pending supervisor validation. | VALIDATED: TBD | RESULT: TBD | GUI_EVIDENCE: N/A
