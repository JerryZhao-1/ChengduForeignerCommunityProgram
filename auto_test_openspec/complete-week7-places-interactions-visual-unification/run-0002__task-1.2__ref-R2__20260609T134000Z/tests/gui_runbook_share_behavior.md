# MCP GUI Runbook: Share Behavior

1. Open `http://127.0.0.1:5174/#/pages/places/detail?id=place_001`.
2. Capture the detail page share button and share summary.
3. Click the share button on H5 and capture the feedback.
4. In mp-weixin or WeChat DevTools, open the same page, invoke the share button/menu, and record the displayed title/path when the tool exposes them.

Expected assertions: share path targets `/pages/places/detail?id=place_001`, title comes from the detail share payload or localized place name, and fallback feedback is not placeholder copy.
