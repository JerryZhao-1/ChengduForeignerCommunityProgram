# MCP-only Admin bilingual readiness runbook

Capture a fresh accessibility snapshot before each element reference and after route/dialog changes.

1. Open `http://localhost:5173/events`; assert `双语发布就绪` and a ready row, then screenshot.
2. Open `新建活动`; assert separate required Chinese/English address inputs and the readiness warning. Keep draft statuses and submit. Capture success and the new row with `待补` diagnostics; assert Publish is disabled.
3. Edit that draft, select approved/published without replacing placeholders, submit, and assert field-name blocking feedback with dialog retained. Restore draft before closing.
4. Publish the complete `已下线活动 / Offline Event`; assert pending protection when observable, success feedback, and refreshed published state.
5. Open `http://localhost:5173/places`; assert ready/waiting diagnostics and disabled Publish controls for incomplete rows; screenshot.
6. Reset and submit the default incomplete Place draft. Assert creation success, `发布待补` fields, and blocked Publish; screenshot.
7. Invoke Publish on a complete existing Place; assert pending protection when observable and success feedback.
8. Store screenshots in `outputs/screenshots/` and write `logs/screenshots-index.md` with URL, record title/id, assertion, and result. Record console errors.
