# MCP GUI Runbook: Visual Unification

1. Capture `http://127.0.0.1:5174/#/pages/places/index`.
2. Capture list with recommended filter, tag filter, empty filter, and an error state if API mocking allows failure.
3. Capture `http://127.0.0.1:5174/#/pages/places/map?id=place_001`.
4. Capture `http://127.0.0.1:5174/#/pages/places/detail?id=place_001`.
5. Capture the recommended route resolving to the filtered list.
6. Repeat at representative mobile viewport sizes.

Expected assertions: controls, chips, badges, cards, loading, empty, and error states look consistent and no text overlaps its container.
