## 1. Shared/API Contracts

- [x] 1.1 Add fixed place secondary category options [#R1]
  - ACCEPT: Shared exports include fixed secondary category arrays for every supported top-level category, while `category_level_2` remains a string.
  - TEST: SCOPE: CLI
    - Run focused shared taxonomy tests.

- [x] 1.2 Add admin event delete contract [#R2]
  - ACCEPT: Shared schemas, paths, contracts, clients, provider types, Koa routes, mock provider, and CloudBase live provider support `DELETE /admin/events/:id`.
  - TEST: SCOPE: CLI
    - Run focused shared client/contract tests and API event delete tests.

## 2. Admin UI

- [x] 2.1 Replace place secondary free text with fixed tab-style options [#R3]
  - ACCEPT: Admin place editing shows secondary category options based on the selected top-level category and preserves legacy current values.
  - TEST: SCOPE: MIXED
    - Run admin typecheck and browser smoke for `/places`.

- [x] 2.2 Improve event check-in, sorting, and delete operations [#R4]
  - ACCEPT: The row action says `核销`; checked-in attendees are marked and sorted after unchecked attendees; event table sorting supports configured fields and direction; row delete confirms and refreshes.
  - TEST: SCOPE: MIXED
    - Run admin typecheck and browser smoke for `/events`.

## 3. Docs and Validation

- [x] 3.1 Update API docs and run validation [#R5]
  - ACCEPT: API docs mention event delete, non-cascading behavior, and updated endpoint count; OpenSpec strict validation and relevant tests pass or blockers are recorded.
  - TEST: SCOPE: CLI
    - Run `openspec validate improve-admin-places-events-ops --strict --no-interactive`, focused Vitest tests, and admin typecheck.
