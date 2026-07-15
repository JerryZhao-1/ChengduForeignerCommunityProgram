# Computer Use GUI observations

- Tool: Computer Use MCP (`@oai/sky`) against Chrome Incognito
- Service: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`
- Mobile device viewport: 390 CSS px wide
- Console result: `0 messages in console`
- Geometry expression: `document.documentElement.scrollWidth + 'x' + document.documentElement.clientWidth`
- Geometry result: `390x390` (no horizontal document overflow)
- Console screenshot: `outputs/en-console-zero-errors.png`
- Geometry screenshot: `outputs/en-390px-console-geometry.png`

## Matrix observations

All eight profile/locale flows produced real plan, route-map, and complete screenshots. File modification timestamps show plan-to-complete capture intervals of 6–91 seconds, all below the 180-second gate.

Computer Use accessibility text was inspected for every flow:

- Raw enum/key matches: 0 across all eight flows.
- AI/model wording matches: 0 across all eight flows.
- Ordered route markers: 8/8 show Stop 1 before Stop 2.
- Completion counters: 8/8 show place 1/1 and event/demo 1/1.
- Map degradation: route pages state that map enhancement is unavailable while the route list remains usable.

## Unmet assertions

- The plan/route/complete pages expose no locale-switch control. Language can only be selected in the onboarding preferences flow, so the required same-session zh → en → zh switch could not be executed and `outputs/zh-en-switch-plan-unchanged.png` was not fabricated.
- Desktop evidence was captured at the available 1140×768 Computer Use window, not the runbook's exact 1280×900 viewport.
