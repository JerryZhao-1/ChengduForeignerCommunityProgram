# MCP GUI runbook

1. Open `http://localhost:5174/#/pages/discover/create`.
2. Verify related place and related event selector controls are visible.
3. Select `Global Corner Cafe` and `Weekend International Brunch`, fill required post fields, submit, and capture the resulting detail screen.
4. Verify detail renders related place and event cards and that each card navigates to the corresponding detail page.
5. Open `http://localhost:5174/#/pages/discover/create?eventId=event_001` and verify the event selector is prefilled.
6. Seed or inspect a post whose linked module is unavailable and verify the fallback text is shown instead of leaking hidden module data.
