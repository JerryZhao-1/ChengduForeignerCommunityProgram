## Why

Admins need a faster, clearer way to enrich place records with usable imagery. The current admin flow still asks for manual cover URLs and "registers" gallery file names before attaching them, while the recent media-source exploration showed that Amap can provide image candidates through place search if the app treats those images as externally sourced references rather than owned file assets.

This change separates two media paths: externally sourced candidate images may be selected and shown with attribution, while community-owned gallery images are uploaded directly and continue to resolve through `gallery_file_ids`.

## What Changes

- Add an admin Amap place search flow that can return external image candidates alongside place metadata.
- Allow admins to select an Amap image as a place `cover_url` or as externally sourced gallery media without downloading, re-uploading, or claiming ownership of that image.
- Require public place detail rendering to distinguish owned gallery media from external gallery media and show source attribution for external images.
- Replace the current "enter a gallery file name, register, and attach" admin UX with a direct file selection upload flow.
- Preserve `gallery_file_ids` as the stable ownership field for uploaded place gallery files and continue deriving public `gallery_media` and `gallery_urls` from resolved file assets.
- Add CloudBase-capable upload behavior for place gallery files so direct admin upload can create a storage object, create a `FileAsset`, and update the target place in one user-facing action.
- Keep Tencent map search as the existing metadata helper; do not require Tencent to provide images.
- Do not integrate Meituan, Dianping, Google, Yelp, or other third-party image providers in this change.
- Do not scrape, proxy, cache, or transcode external provider images unless a future change proves explicit rights and storage terms.

## Capabilities

### New Capabilities

- `place-external-media-sources`: Admins can search supported external place providers for image candidates, save selected external image references on places, and public detail surfaces can display them with source attribution.

### Modified Capabilities

- `places-admin-management`: Admin place management gains direct gallery upload and external image selection behavior while preserving `gallery_file_ids` for owned uploads.
- `places-public-contract`: Public place detail includes externally sourced gallery media with provider attribution without exposing those references through list or marker payloads.
- `places-detail-media-experience`: Mobile detail renders owned gallery media and externally sourced media distinctly, including source attribution for external images.
- `files-auth-notifications-readiness`: Files flow must support protected direct place-gallery upload completion instead of only upload request and manual completion registration.

## Impact

- Shared schemas/contracts for places, media, files, and admin provider search.
- `apps/api` routes/providers for Amap search, external media validation, direct place-gallery upload, CloudBase storage integration, and file asset creation.
- `apps/admin` place editor: provider search UI, external image candidate selection, source labels, and direct image file upload controls.
- `apps/mobile` place detail gallery rendering and source attribution.
- CloudBase configuration: Amap key/secret environment variables and CloudBase storage upload behavior.
- Documentation: API manual, implemented API list, environment variable docs, and media-source rights assumptions.
- Tests: schema/contract tests, API route/provider tests, admin and mobile typechecks, and GUI validation runbooks for the media workflows.
