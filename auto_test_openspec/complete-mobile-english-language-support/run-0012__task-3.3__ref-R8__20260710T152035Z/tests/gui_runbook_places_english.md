# MCP-only Places English runbook

1. Select English in Language settings and open `/pages/places/index`.
2. Assert localized list title, filters, top-level/secondary category labels, tags, formal name/address/summary, recommendation badge, loading/empty/error copy.
3. Open `place_001`; assert localized category path, address, business hours, intro, recommendation, gallery alt behavior, Related Discussion, comment count, navigation/share/favorite labels.
4. Toggle favorite and assert localized feedback; invoke Copy link and assert no console error.
5. Open `/pages/places/map`; assert localized H5 fallback, localized marker summary category, list/detail/navigation actions, and no map-key error.
6. Switch to Chinese and smoke the list/category/tag rendering, then restore English.
7. Save list/detail/map screenshots and console results under `outputs/` and `logs/`.
