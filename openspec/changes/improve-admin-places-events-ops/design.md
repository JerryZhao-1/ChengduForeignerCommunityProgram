## Context

Admin places already stores `category_level_2` as a string, and existing imported or test records use values such as `community-center`, `service-desk`, `cafe`, `clinic`, and `metro-station`. The change should make admin entry more consistent without breaking old data.

Admin events already supports list, create, update, review, registration inspection, and check-in. Delete is absent from the shared event contract and provider boundary, so adding a button requires a matching API capability.

## Decisions

1. Keep `category_level_2` as a string field.

   The fixed options are editor guidance, not a schema-breaking enum. This avoids rejecting legacy/imported data and lets public/API payloads remain backward compatible.

2. Delete events without cascading registrations or tickets.

   This matches place hard-delete semantics for the primary record while avoiding irreversible deletion of check-in/audit-adjacent records in this slice.

3. Keep event sorting local to the admin page.

   `GET /admin/events` currently returns all admin rows without paging or query parameters. Local sorting satisfies the operator need with less contract surface and can be promoted to server-side sorting later if data volume requires it.

## Risks / Trade-offs

- Legacy secondary category values can remain visible while editing. The editor shows them as current-value options so admins can decide whether to normalize.
- Non-cascading event delete leaves orphaned registration/ticket records at the data layer. This is intentional for now and should be revisited if export/audit tooling later needs a formal deleted-event relationship.
- Local sorting only applies to loaded rows. This is acceptable for the current admin list shape.

## Migration Plan

1. Add shared secondary category taxonomy and event delete contract.
2. Wire delete through route/provider/client layers.
3. Update admin places and events UI.
4. Update tests/docs and validate OpenSpec, shared/API tests, and admin typecheck.
