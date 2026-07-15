# R16 run-0036 Supervisor verdict

- Date: 2026-07-15
- Run: 0036
- Task / Ref: 16.1 / R16
- Scope: MIXED
- GUI execution: Computer Use MCP
- Final verdict: **FAIL**

## Passing evidence

- 4 profiles × 2 locales × plan/route-map/complete: 24/24 screenshots captured.
- All eight capture intervals are below 180 seconds.
- Browser console: 0 messages.
- 390px document geometry: `scrollWidth=390`, `clientWidth=390`.
- Raw enum/key scan of Computer Use accessibility text: 0 matches.
- AI/model wording scan of Computer Use accessibility text: 0 matches.
- Ordered two-stop route: 8/8.
- Completion counters: 8/8 show place 1/1 and event/demo 1/1.

## Failing / incomplete evidence

1. The generated-plan journey has no visible or accessible locale-switch control. The required same-session zh → en → zh switch could not be performed, so session/scenario preservation across a post-plan switch is unverified.
2. Desktop evidence used the available 1140×768 Computer Use window rather than exactly 1280×900.

R16 remains open. This folder is now immutable; a fix and retry must use a new run number. R17 CLI health is independently PASS in run-0035.
