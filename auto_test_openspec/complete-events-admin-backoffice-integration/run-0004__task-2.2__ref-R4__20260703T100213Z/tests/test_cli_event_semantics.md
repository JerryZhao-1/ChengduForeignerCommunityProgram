# CLI Assertions

Run `run.sh` or `run.bat`.

Required assertions:

- Admin-created draft is visible to admin and hidden from public reads.
- Approved/published events become public.
- Offline and ended events are hidden from public reads.
- Registration before `start_time` remains allowed when published and before `signup_deadline`.
- Duplicate, full, ended, deadline, wrong-event ticket, already-used ticket, and non-admin paths return stable error envelopes.
