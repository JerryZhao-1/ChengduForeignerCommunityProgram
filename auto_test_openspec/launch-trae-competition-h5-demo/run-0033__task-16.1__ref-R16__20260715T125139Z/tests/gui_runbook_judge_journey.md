# MCP-only judge journey runbook (R16)

Use the configured browser MCP against the URL printed by `run.sh`/`run.bat`. Do not create or execute Playwright/Selenium/browser scripts.

## Profile matrix

Run the full flow for four representative profiles in both zh and en (8 runs total). For each profile, time welcome → complete and confirm it is under 180 seconds.

1. `community-service` / `first-week` / `solo` / `none`
2. `food-drink` / `first-month` / `family-with-kids` / `wheelchair`
3. `social` / `settled` / `couple` / `low-vision`
4. `outdoor-sports` / `first-week` / `shared` / `quiet-environment`

## Steps

1. Set viewport to 390 × 844. Open `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`. Verify the guest notice is visible and no login/bearer/mock-actor prompt appears.
2. Use "Build my plan" (judge entry). Complete the four preference steps by keyboard (Tab + Enter/Space). Verify each dimension is single-choice: a new selection replaces the old one, and `none` is labeled "无额外需求 / No additional need".
3. Submit. Verify the generating steps appear in order (check time, match places, organize tips, prepare route). Verify the plan page shows: title + 120min duration, curated disclosure, bilingual summary, four ordered reason labels (primary interest → arrival stage → household → participation guidance), and the two stop cards. Confirm no AI/model/generated_by/provider status text appears.
4. On the plan page, click "View route". Verify route-map renders BOTH stops in order: the place card (cover, name, coordinates, "View place") AND the event card (cover, title, summary, "View event"). Verify the "map enhancement unavailable" notice is shown and the route list is fully usable without a map.
5. Return to plan. Click "Mark visited" on the place card, then "Demo Confirm" on the event card. Verify the Demo Confirm disclosure states it creates no registration/reservation/ticket/capacity. Verify "Finish Route" becomes enabled only after both actions.
6. Click "Finish Route" and verify the complete page shows place 1/1 and event 1/1.
7. Switch language (zh ↔ en) on the plan page. Verify the plan is not re-matched, scenario_key is unchanged, and all copy updates immediately.
8. Refresh the plan/route-map/complete page directly (stateless deep link). Verify it redirects to welcome.
9. On complete, click "Start Over". Verify it resets and returns to welcome.
10. Set viewport to 1280 × 900. Repeat one profile. Verify the layout is centered with max-width, no horizontal scroll, and targets remain ≥44px with visible focus.
11. Map degradation: confirm the route-map page never depends on a map SDK; the two-stop list is the complete baseline.
12. Place 404 path: if feasible via mock/network, trigger a place detail 404 and verify the place is marked unavailable and the complete page adjusts the denominator.

## Screenshot index

For each of the 8 profile/locale runs, save at minimum:
- `outputs/<locale>-<profile>-plan.png` (plan page with four reasons)
- `outputs/<locale>-<profile>-route-map.png` (route-map with both stops)
- `outputs/<locale>-<profile>-complete.png` (complete page)

Plus:
- `outputs/zh-desktop-plan.png` (1280 × 900 desktop plan)
- `outputs/zh-focus-visible.png` (keyboard focus state)

Record all paths and observations in `logs/gui-screenshot-index.md`. The Supervisor, not the worker, writes the final PASS/FAIL decision in `logs/supervisor-verdict.md`.
