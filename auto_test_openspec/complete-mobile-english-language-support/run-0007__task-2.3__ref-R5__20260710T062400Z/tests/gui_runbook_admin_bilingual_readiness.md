# MCP-only Admin bilingual readiness runbook

Use the browser MCP only and refresh snapshots before every interaction.

1. Open `http://localhost:5173/events`. If routed to login, enter non-sensitive local mock values and submit; assert Events loads.
2. Assert the Event table has `双语发布就绪`; capture a ready row screenshot.
3. Open `新建活动`; assert distinct Chinese/English required address inputs and readiness warning. Keep draft statuses and submit. Assert success and new `待补` row; Publish must be disabled.
4. Edit the new draft, choose approved/published with placeholders, submit, and assert exact field-name blocking with dialog retained. Restore draft before closing.
5. Publish `已下线活动 / Offline Event`; assert pending state if observable, success feedback, and published refresh.
6. Open `/places`; assert ready/waiting diagnostics and disabled incomplete Publish controls.
7. Reset and submit default incomplete Place draft; assert success, `发布待补`, and blocked Publish.
8. Publish a complete existing Place; assert pending state if observable and success feedback.
9. Save Event table, Event form/blocker, Place table, and Place blocker screenshots in `outputs/screenshots/`; write `logs/screenshots-index.md` with URLs, record titles/ids, assertions, observed results, and console errors.
