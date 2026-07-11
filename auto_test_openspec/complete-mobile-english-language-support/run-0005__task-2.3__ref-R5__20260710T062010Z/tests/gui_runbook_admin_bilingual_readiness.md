# MCP runbook: Admin bilingual publication readiness

Use the browser MCP exclusively. Capture a fresh snapshot before each element reference and after each route/dialog/state change.

1. Navigate to `http://localhost:5173/events` and capture the loaded table.
   - Assert a `双语发布就绪` column exists.
   - Assert ready rows show `双语就绪`.
2. Open `新建活动`.
   - Assert distinct `中文活动地址（发布必填）` and `英文活动地址（发布必填）` inputs.
   - Assert the readiness alert lists placeholder/missing formal fields.
   - Leave status as draft and submit; capture the success feedback and new table row.
   - Assert the new row shows actionable `待补` readiness diagnostics and its publish action is disabled.
3. Open the new Event draft, select approved/published without completing placeholders, and submit.
   - Assert local blocking feedback lists exact field names and the dialog remains open.
   - Restore draft status and close without an unintended publication.
4. On a complete non-public Event fixture such as `已下线活动 / Offline Event`, invoke `通过并发布`.
   - Assert one in-flight control is disabled/loading while pending when observable.
   - Assert success feedback appears and the row refreshes to published.
5. Navigate to `http://localhost:5173/places`.
   - Assert the table displays `双语发布就绪` or `发布待补` diagnostics.
   - Assert incomplete rows have a disabled Publish control with exact missing fields in its title.
6. Reset the Place form to its default incomplete draft and submit.
   - Assert draft creation succeeds.
   - Assert the created row has `发布待补` diagnostics and cannot publish.
7. Use a complete existing published Place row and invoke Publish.
   - Assert success feedback and refreshed state; observe pending protection when possible.
8. Save screenshots for Event table readiness, Event bilingual address/form blocker, Place table readiness, and Place draft blocker under `outputs/screenshots/`.
9. Write `logs/screenshots-index.md` mapping each screenshot to URL, record title/id, asserted state, and observed result. Record console errors if any.
