# Screenshots index

- outputs/screenshots/events-table-readiness.png
  - URL: http://localhost:5173/events
  - Records: event_001 and seeded Event rows
  - Assertion: 双语发布就绪 column renders; complete records show 双语就绪; placeholder drafts list exact fields and have disabled publish controls.
- outputs/screenshots/event-form-blocker.png
  - URL: http://localhost:5173/events
  - Record: new Event draft form
  - Assertion: distinct Chinese/English address fields; blocker lists title_zh, title_en, summary_zh, summary_en, content_zh, content_en, address_en.
- outputs/screenshots/places-table-readiness.png
  - URL: http://localhost:5173/places
  - Records: place_001, place_002, place_draft
  - Assertion: complete records show 双语发布就绪 and default form lists exact placeholder fields.
- outputs/screenshots/place-draft-blocker.png
  - URL: http://localhost:5173/places
  - Record: 新增地点草稿 (created through Admin)
  - Assertion: draft save succeeds; row shows 发布待补 fields; Publish control resolves disabled.
- outputs/screenshots/place-pending-protection.png
  - URL: http://localhost:5173/places
  - Record: Global Corner Cafe
  - Assertion: publish action completed and refreshed; code-backed publishingId guard and loading binding prevent re-entry. Spinner was too brief for a stable DOM assertion in mock mode.

## Observed states

- Incomplete Event draft saved and appeared with exact field diagnostics.
- Event Publish button for the new draft: enabled=false.
- Complete Offline Event transitioned to published.
- Incomplete Place draft saved and appeared with exact field diagnostics.
- Place Publish button for the new draft: enabled=false.
- Complete Tongzilin Service Point transitioned from draft to published.
- Console errors: none.
