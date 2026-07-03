# CLI Assertions

Run `run.sh` or `run.bat`.

Required assertions:

- `packages/shared/src/contracts/events.ts` exposes `adminList` and `adminRegistrations`.
- `packages/shared/src/contracts/paths.ts` exposes `/admin/events` and `/admin/events/:id/registrations`.
- `packages/shared/src/client.ts` and mock client expose `admin.listEvents()` and `admin.listEventRegistrations(eventId)`.
- Shared tests reject incomplete admin list and registration row payloads.
