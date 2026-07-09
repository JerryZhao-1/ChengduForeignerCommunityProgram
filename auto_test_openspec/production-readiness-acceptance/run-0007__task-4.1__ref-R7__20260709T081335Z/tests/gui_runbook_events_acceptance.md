# GUI Runbook - Events Registration, Ticket, And Admin Check-In

Evidence owner: Supervisor / manual GUI runner

Mini Program project: `apps/mobile/dist/build/mp-weixin`

Admin Web: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`

API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

Save evidence under:

`auto_test_openspec/production-readiness-acceptance/run-0007__task-4.1__ref-R7__20260709T081335Z/outputs/`

## Required Files

- `events-list.png`
- `events-detail.png`
- `events-signup-success.png`
- `events-my-registrations.png`
- `events-ticket.png`
- `admin-event-registrations.png`
- `admin-checkin-success.png`
- `admin-repeat-checkin-feedback.png`
- `events-acceptance-result.json`
- `events-console.log`

## Steps

1. Open the Mini Program Events tab.
2. Open a published acceptance event.
3. Register as a member and record the registration id and ticket id when visible or through API output.
4. Open My Registrations and the ticket view.
5. Open Admin Web and inspect the event registrations.
6. Check in the ticket once and confirm success.
7. Attempt to check in the same ticket again and confirm clear repeated-check-in feedback.
8. Record screenshots and console/API errors.

## Result JSON Template

```json
{
  "surface": "wechat-devtools-or-true-device-plus-admin-web",
  "event_id": "<event-id>",
  "registration_id": "<registration-id>",
  "ticket_id": "<ticket-id>",
  "mini_program_registration_ok": true,
  "ticket_visible": true,
  "admin_registration_visible": true,
  "checkin_success": true,
  "repeat_checkin_feedback": "Ticket is not valid for check-in.",
  "screenshots": [
    "events-list.png",
    "events-detail.png",
    "events-signup-success.png",
    "events-my-registrations.png",
    "events-ticket.png",
    "admin-event-registrations.png",
    "admin-checkin-success.png",
    "admin-repeat-checkin-feedback.png"
  ],
  "console_log": "events-console.log",
  "notes": ""
}
```

