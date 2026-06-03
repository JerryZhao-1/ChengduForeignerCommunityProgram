## 1. Shared Contracts And Query Semantics

- [x] 1.1 Refine the shared places list query and list item contract for the v1 list truth [#R1]
  - ACCEPT: `packages/shared` defines the supported public list inputs and card-oriented list item fields for v1 list browsing without introducing detail-only fields into the list response contract.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: contract/schema tests confirm supported query inputs, sort enum, pagination defaults, and list-item field boundaries

- [x] 1.2 Add or update shared tests for places list query normalization and card field boundaries [#R2]
  - ACCEPT: Shared tests cover query parsing for `page`, `pageSize`, `communityId`, `keyword`, `category`, `recommended`, and `sort`, and assert that detail-only fields are not accepted as list-item output truth.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: shared Vitest coverage passes and includes positive and negative assertions for query and list payload boundaries

## 2. Public Places List Backend

- [x] 2.1 Update provider types and public list implementation to treat `GET /places` as the v1 list truth [#R3]
  - ACCEPT: Provider interfaces and list implementations expose consistent support for keyword, category, recommended, sort, page, and pageSize inputs and return paginated card-oriented results.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: provider-level tests confirm equivalent list behavior for supported inputs and stable page envelopes

- [x] 2.2 Enforce public `published` visibility, filtering, sorting, and pagination consistently across route paths [#R4]
  - ACCEPT: Public list reads only return `published` places in the target community and apply filtering, sorting, and pagination consistently across Koa route and CloudBase handler execution modes.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: route and cloudbase parity tests cover keyword, category, recommended, sort, pagination, unpublished exclusion, and invalid query validation

## 3. Mobile List And Home Entry

- [x] 3.1 Rebuild the mobile places list page as a v1 browsing surface [#R5]
  - ACCEPT: `apps/mobile/src/pages/places/index.vue` shows real place cards, keyword search, category entry, recommendation entry, and shared loading, empty, and error states using the public list endpoint.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: CLI checks cover build or test safety; MCP GUI runbook verifies keyword search, category switching, recommendation entry, and card-to-detail navigation

- [x] 3.2 Turn the home page `Places` section into a real list entry while keeping previews [#R6]
  - ACCEPT: `apps/mobile/src/pages/home/index.vue` exposes a clear main entry to the places list, keeps a recommended entry into the filtered list, retains preview items, and removes placeholder wording for the places module.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: MCP GUI runbook verifies the main entry goes to `/pages/places/index`, the recommended entry applies the recommended list filter, and preview items still open detail pages

## 4. Spec Hygiene

- [x] 4.1 Validate the OpenSpec change and record the Figma reference in change-local docs [#R7]
  - ACCEPT: The change includes `proposal.md`, `design.md`, `tasks.md`, and both spec delta files, and `openspec validate add-places-list-v1-and-query-enhancements --strict --no-interactive` passes.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/`
    - run-folder MUST be:
      `run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/`
    - Run: `auto_test_openspec/add-places-list-v1-and-query-enhancements/<run-folder>/run.sh` or `run.bat`
    - Verify: strict OpenSpec validation succeeds and the design doc records the provided Figma URL, file key, and node id
