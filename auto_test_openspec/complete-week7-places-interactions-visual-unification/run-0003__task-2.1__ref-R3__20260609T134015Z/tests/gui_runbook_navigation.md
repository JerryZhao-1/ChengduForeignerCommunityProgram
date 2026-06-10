# MCP GUI Runbook: Native Navigation

1. Open `http://127.0.0.1:5174/#/pages/places/detail?id=place_001`.
2. Capture the loaded detail page, then click the navigation action.
3. Record whether the platform launches native location or shows the configured failure feedback.
4. Return to `http://127.0.0.1:5174/#/pages/places/map?id=place_001`, select the same place if needed, and click its navigation action.
5. Capture that the page remains loaded after success, denial, or simulator failure.

Expected assertions: both surfaces use localized place names, consistent failure copy, and keep the selected place state visible.
