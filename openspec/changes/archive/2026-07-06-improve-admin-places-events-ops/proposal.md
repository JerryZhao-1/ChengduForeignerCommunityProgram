## Why

Operators need faster admin workflows for place classification and event operations. Place secondary categories are currently free text, which makes maintenance inconsistent. Event management already has check-in primitives, but the admin UI still labels the workflow as registration, does not visually separate checked-in attendees, lacks list sorting, and cannot delete events.

## What Changes

- Fix secondary place categories under each existing top-level category and render them as tab-style admin options while preserving legacy string values.
- Add admin event hard delete through `DELETE /admin/events/:id`.
- Rename the event row check-in entry from registration-oriented copy to check-in-oriented copy.
- Mark checked-in attendees, sort them after unchecked attendees, and prevent refilling used tickets from the drawer.
- Add local sorting controls to the admin events table.

## Capabilities

### New Capabilities

- Admins can delete event records through the shared API and admin UI.

### Modified Capabilities

- `places-admin-management`: Admin place editing uses a fixed secondary category option set for new maintenance while preserving legacy values.
- `events-integration-readiness`: Admin event operations include delete, clearer check-in UX, and local list sorting.

## Impact

- Shared schemas, contracts, paths, types, mock client, and mock service.
- API event routes and mock/CloudBase providers.
- Admin `PlacesPage.vue` and `EventsPage.vue`.
- API documentation and focused shared/API/admin validation.
