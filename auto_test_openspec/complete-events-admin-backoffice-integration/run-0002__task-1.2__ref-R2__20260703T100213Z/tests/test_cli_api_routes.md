# CLI Assertions

Run `run.sh` or `run.bat`.

Required assertions:

- `GET /admin/events` returns a standard success envelope for admin actors.
- Non-admin actors receive `403 FORBIDDEN`.
- `GET /admin/events/:id/registrations` returns joined ticket state.
- Missing event registration list returns `404 NOT_FOUND`.
- CloudBase compatibility handler supports `/api/admin/events` and `/api/admin/events/:id/registrations`.
