# MCP-only onboarding runbook

Use the configured browser MCP against the URL printed by `run.sh`/`run.bat`. Do not create or execute Playwright/Selenium/browser scripts.

1. Set the viewport to 390 × 844 and open the canonical guest URL.
2. Start “Build my plan”, switch to English, and activate interest choices by keyboard. Verify the second choice replaces the first and focus remains visible.
3. Complete arrival and household choices. On accessibility, choose `none`, then another need, and verify only the latest choice is selected.
4. Submit in mock mode. Verify the English offline badge is visible, the plan has a summary, and the reason labels appear exactly once in this order: primary interest, arrival stage, household, participation guidance.
5. Save a full-page screenshot as `outputs/en-mobile-local-plan.png` and record its path plus assertions in `logs/gui-screenshot-index.md`.
6. Start over, switch to Chinese, use the example profile, and generate again. Verify the Chinese offline badge and all four Chinese explanation labels.
7. Set the viewport to 1280 × 900, verify the same single-column flow remains centered and usable, then save `outputs/zh-desktop-local-plan.png` and index it.
8. Record target-size, focus-visible, locale, badge, summary, and four-reason observations. The Supervisor, not the worker, writes the final PASS/FAIL decision.

