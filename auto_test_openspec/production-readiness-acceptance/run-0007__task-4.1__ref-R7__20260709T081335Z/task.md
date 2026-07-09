# Task 4.1 - Events Registration, Ticket, And Admin Check-In Acceptance

Change: `production-readiness-acceptance`

Reference: `#R7`

Scope: Mixed

The CLI portion creates and publishes a CloudBase dev event, registers a member, reads the ticket, performs Admin check-in, and verifies repeated check-in returns a recoverable conflict.

The GUI portion is documented in `tests/gui_runbook_events_acceptance.md` and must be executed in WeChat DevTools or on a true device.

## Run

```bash
./run.sh
```

Outputs are written to `outputs/`; logs are written to `logs/`.

