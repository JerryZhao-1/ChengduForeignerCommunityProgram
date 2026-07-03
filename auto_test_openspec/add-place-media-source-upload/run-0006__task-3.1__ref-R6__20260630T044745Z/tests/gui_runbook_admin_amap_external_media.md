# MCP GUI Runbook: Admin Amap External Media

Use browser MCP only. Do not run executable browser automation scripts.

1. Open `http://127.0.0.1:5173/places`.
2. Start editing an existing place or create/save a draft place.
3. In the Amap image candidate section, search a keyword such as `桐梓林`.
4. Capture the candidate list with image thumbnails and `Image source: Amap` labels.
5. Choose one candidate as cover and one as external gallery media.
6. Save media settings, reload the place editor, and capture that `cover_source` and external media labels remain visible.
7. Remove the external gallery reference, save again, and capture that uploaded file ids remain unchanged.
