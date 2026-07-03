# CLI Assertions

Run `run.sh` or `run.bat`.

Required assertions:

- `createMockService().events.listAdmin()` includes `event_draft`, `event_pending`, `event_offline`, and `event_ended`.
- Public `events.list()` hides those management-only events.
- `event_full` reports `active_registration_count=1`, `confirmed_attendee_count=2`, `remaining_capacity=0`, and `is_full=true`.
- Admin registration rows include `ticket_id`, `ticket_code`, `ticket_status`, and `ticket_used_at`.
