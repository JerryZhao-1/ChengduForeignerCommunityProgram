# MCP-only complete-flow runbook

Use only the configured browser MCP against the URL printed by the start script. Do not create or execute browser automation scripts.

1. At 390 × 844, exercise these profiles: community-service/first-week/solo/none; family-kids/first-month/family-with-kids/low-mobility; food-drink/settled/couple/quiet-environment; transport/first-week/shared/wheelchair. Cover both zh and en rendering.
2. For each profile, record scenario key, catalog version, selected refs, summary, and the four ordered reason dimensions in `logs/gui-screenshot-index.md`.
3. Verify every mock-mode plan shows the localized offline badge. Save representative mobile screenshots under `outputs/` with run-specific names.
4. Set 1280 × 900 and verify the same centered single-column experience; save a desktop screenshot.
5. Exercise route degradation by blocking cover-image and detail requests through MCP network controls. Verify the route list/card stays readable and actionable; save screenshots.
6. Complete one canonical flow: mark the place visited, select Demo Confirm, and Finish Route. Record elapsed time and verify `1/1` visit plus `1/1` demo confirmation. Confirm network observations contain no registration, ticket, availability, or capacity write.
7. Use Start Over and verify the fresh draft. Refresh/deep-link to a plan page without state and verify redirect to welcome.
8. Record every screenshot path and assertion. The Supervisor, not the worker, writes the final PASS/FAIL decision.

