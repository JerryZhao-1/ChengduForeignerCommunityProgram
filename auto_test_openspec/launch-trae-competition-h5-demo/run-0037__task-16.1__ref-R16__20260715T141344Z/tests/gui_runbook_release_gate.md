# Computer Use GUI runbook

All browser interaction and screenshot capture MUST be performed through Computer Use MCP. The launcher only starts the local mock H5 server.

1. Open `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome` at 390×844.
2. Run these profiles in zh and en, saving plan, route-map, and complete screenshots:
   - community-service / first-week / solo / none
   - food-drink / first-month / family-with-kids / wheelchair
   - social / settled / couple / low-vision
   - outdoor-sports / first-week / shared / quiet-environment
3. On a generated zh plan, capture the scenario/route, switch zh → en → zh, and verify the same route and progress remain. Save `outputs/zh-en-switch-plan-unchanged.png` after the round trip.
4. Inspect the browser console and 390px document geometry.
5. Emulate exactly 1280×900 in Chrome DevTools, repeat one profile, and save `outputs/zh-desktop-plan.png`.
6. Write the screenshot index, machine-readable checks, observations, and Supervisor PASS/FAIL verdict.
