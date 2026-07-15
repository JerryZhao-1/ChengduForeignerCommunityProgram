# R16 run-0037 Supervisor verdict

- Date: 2026-07-15
- Run: 0037
- Task / Ref: 16.1 / R16
- Scope: MIXED
- GUI execution: Computer Use MCP
- Final verdict: **PASS**

## Evidence

- 4 profiles × 2 locales × plan/route-map/complete: 24/24 fresh screenshots from the corrected build.
- All eight plan-to-complete capture intervals are below 180 seconds (maximum 8 seconds).
- Browser console: 0 messages.
- 390px document geometry: `scrollWidth=390`, `clientWidth=390`.
- Raw enum/key scan of Computer Use accessibility text: 0 matches.
- AI/model wording scan of Computer Use accessibility text: 0 matches.
- Ordered two-stop route: 8/8.
- Completion counters: 8/8 show place 1/1 and event/demo 1/1.
- Visible plan controls completed zh → en → zh without changing the route. A regression test verifies plan object identity, `scenario_key`, and item progress remain unchanged.
- Desktop plan captured at exact 1280×900 CSS emulation; DPR 2 produced a 2560×1800 PNG.

Run-0036 remains immutable FAIL evidence and is superseded for current R16 proof by this corrected PASS retry. This run-0037 folder is now immutable.
