## Context

Places already have two media concepts that are not cleanly reflected in the admin experience:

- `cover_url` is manually typed and can point anywhere.
- `gallery_file_ids` is the owned-gallery source of truth, while public detail derives `gallery_media` and `gallery_urls` from resolved file assets or CloudBase file ids.

The admin UI currently asks for a gallery file name and then registers/completes a file asset before updating `gallery_file_ids`. This is technically aligned with the file-backed contract, but the user-facing workflow feels like manual attachment instead of direct upload.

The recent provider exploration found that Amap WebService POI search can return `photos` for place candidates, while Tencent search does not expose usable image fields. Amap images must be treated as externally hosted provider media: the system can store references and attribution, but it must not download, re-upload, cache, or present them as community-owned assets without a future rights review.

## Goals / Non-Goals

**Goals:**

- Let admins search Amap POI candidates from the place editor and review provider image candidates.
- Let admins select an Amap image for external gallery display or as a cover URL with source attribution.
- Keep external provider images separate from owned file assets.
- Replace the manual gallery registration UI with direct file selection upload.
- Keep `gallery_file_ids` as the stable owned-gallery field and continue deriving owned `gallery_media` and `gallery_urls` for public detail.
- Support direct place-gallery upload in local/mock and CloudBase live provider modes.
- Preserve existing Tencent search behavior for place metadata.

**Non-Goals:**

- Integrate Meituan, Dianping, Google, Yelp, Baidu, or other providers.
- Scrape public websites or bypass provider APIs.
- Download, proxy, cache, resize, watermark, or transcode Amap-hosted images.
- Replace `gallery_file_ids` or rewrite public list/map contracts.
- Add a general-purpose media library or multi-community media ownership model.

## Decisions

1. Model external media as source-attributed references, not file assets.
   - Add shared schemas for externally sourced place media. The minimum shape should include provider source (`amap`), source place id, provider image URL, optional provider image title, and display attribution.
   - Store external gallery references separately from `gallery_file_ids`, for example `external_gallery_media`.
   - For an external cover selection, keep using `cover_url` for display compatibility but persist source attribution metadata alongside it, for example `cover_source`.
   - Rationale: Public clients can render a URL consistently while still showing provider attribution and avoiding false ownership.
   - Alternative considered: Download Amap images and upload them into CloudBase. Rejected for this change because external rights and storage terms are not established.

2. Keep owned uploads on the existing file-backed gallery contract.
   - Direct upload should result in a real storage object, a completed active `FileAsset`, and an updated place `gallery_file_ids` array.
   - Public detail should continue deriving owned `gallery_media` and `gallery_urls` from resolved file assets or CloudBase temporary URLs.
   - Rationale: This preserves existing public contracts and prior CloudBase gallery-media acceptance.
   - Alternative considered: Store direct uploaded image URLs directly in `gallery_urls`. Rejected because `gallery_urls` is a compatibility projection, not an admin-owned source field.

3. Add a higher-level admin upload endpoint or contract instead of exposing the old mental model.
   - The implementation can keep lower-level upload request and complete endpoints for compatibility, but the place editor should call a single user-facing operation that accepts a selected file and target place id.
   - For browser/Admin HTTP mode, a multipart endpoint such as `POST /admin/places/:id/gallery-files` is the cleanest BFF shape.
   - For CloudBase live mode, the route should upload to CloudBase storage, register the `FileAsset`, update the place, and return the updated media attachment summary or place record.
   - Rationale: The UI should not ask the admin to invent a file name and think about "attachment"; it should perform "choose image -> upload -> appears in gallery."
   - Alternative considered: Keep two public JSON calls and only wrap them in UI. Rejected because CloudBase live file upload remains incomplete and the admin workflow would still depend on a mock-style upload URL.

4. Add an Amap provider adapter behind the API.
   - The admin app should not call Amap directly or expose provider keys in frontend env vars.
   - The API should read Amap credentials from environment variables, validate upstream responses, normalize candidate fields, and return standard API envelopes.
   - Rationale: Existing Tencent search already follows this backend-proxy pattern.
   - Alternative considered: Use frontend-only Amap calls. Rejected because it leaks keys and would duplicate request signing/error handling.

5. Public payload boundaries remain split by surface.
   - Public list and map markers must not include owned gallery arrays or external gallery arrays.
   - Public detail is the only public place payload that includes owned and external media details.
   - Rationale: This preserves the v1 list/map/detail split and avoids heavy list/map responses.

6. Attribution is required wherever external media is displayed.
   - The mobile detail page must label externally sourced images with provider/source text.
   - If the cover image is externally sourced and visible on detail, the detail page must expose or render the associated attribution.
   - Rationale: External images are not community-owned assets and need a visible provenance marker.

## Risks / Trade-offs

- [Risk] Amap photo URL availability or terms may change. -> Mitigation: Treat external media as optional enhancement, keep owned uploads as the durable path, and document provider assumptions.
- [Risk] External hotlinked images may fail, be slow, or be blocked in Mini Program/H5 contexts. -> Mitigation: Render broken-image fallback states and keep direct upload as the recommended production-quality gallery path.
- [Risk] Adding external media fields can blur public contract boundaries. -> Mitigation: Add schema and API tests proving list and marker payloads exclude external media fields.
- [Risk] Direct file upload implementation differs between mock/local and CloudBase live mode. -> Mitigation: define one shared contract and add provider-specific tests for asset creation, place update, and permission denial.
- [Risk] Amap search adds another configured external dependency. -> Mitigation: fail with a configuration error envelope when credentials are missing and keep Tencent search operational.

## Migration Plan

1. Add nullable/defaulted external media fields so existing place records remain valid.
2. Keep existing `cover_url`, `gallery_file_ids`, `gallery_media`, and derived `gallery_urls` behavior intact.
3. Retain lower-level files endpoints for existing tests and callers.
4. Replace only the Admin place editor's gallery management workflow with direct upload.
5. Update docs to mark Amap external images as referenced provider media, not owned CloudBase assets.
6. Rollback by hiding the Amap search and direct upload UI while preserving existing place records; external media fields can remain ignored by older clients.

## Open Questions

- Exact Amap credential env var names should be finalized during implementation; likely `AMAP_WEB_SERVICE_KEY` and optional signing secret if required by the chosen API.
- Whether external cover attribution should be stored as a dedicated `cover_source` field or through a reusable media attribution object is left to implementation, but public detail must provide enough data for attribution.
- Whether the direct upload route returns an updated `Place` or a smaller media result should be chosen based on existing client ergonomics and test simplicity.
