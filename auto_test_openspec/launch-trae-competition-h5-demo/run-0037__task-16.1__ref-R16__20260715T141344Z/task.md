# R16 run-0037 — locale-switch GUI correction

- Task / Ref: 16.1 / R16
- Scope: MIXED
- Worker role: start the mock H5 server only.
- Supervisor role: execute every interaction and screenshot through Computer Use MCP.
- Supersedes for current R16 evidence: run-0036, which remains immutable and FAIL.
- Product correction under test: the plan page now exposes zh/en controls that update rendering language without regenerating or replacing the in-memory plan.

## Acceptance

- Four representative profiles × two locales reach plan, route-map, and complete in under 180 seconds.
- Plan copy contains no raw enum/key or AI/model wording.
- Route map renders two ordered stops and completion shows 1/1 for place and event.
- At 390px, document scroll width equals client width.
- A zh → en → zh switch on the generated plan preserves the route, progress, and scenario identity.
- One desktop plan is captured at an exact 1280×900 emulated viewport.
- Browser console has zero messages.

After outputs, logs, and the Supervisor verdict are written, this folder is immutable.
