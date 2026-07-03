# MCP GUI Runbook: Mobile External Media Detail

Use browser MCP only. Do not run executable browser automation scripts.

1. Open Mobile H5 at `http://127.0.0.1:5174/#/pages/places/index`.
2. Capture an existing owned-media detail page, verifying owned gallery images have no external provider label.
3. In Admin/API, create or update a published place with `external_gallery_media` and `cover_source`, then open `#/pages/places/detail?id=<id>`.
4. Capture the external cover attribution near the cover and external gallery labels in the gallery.
5. Create or update a mixed owned/external place and capture both media types in one gallery.
6. Use an intentionally broken external image URL and capture the fallback state while the rest of the detail page remains usable.
