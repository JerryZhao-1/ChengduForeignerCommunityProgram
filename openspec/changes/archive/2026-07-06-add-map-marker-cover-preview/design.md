## Context

The mobile places map currently uses `GET /places/map-markers` and `PlaceMapMarker` as its only data source. That payload contains marker-safe data only: id, localized names, top-level category, recommendation state, and coordinates. The map page renders native `map` markers with a text callout and a summary card below the map.

The list and detail contracts already expose `cover_url`, and admin workflows already maintain place covers. The missing piece is allowing the map marker surface to use the same cover URL as a lightweight preview without pulling in detail-only media data.

The UI must work across uni-app H5 and WeChat Mini Program. The native `map` component has stricter layering behavior than normal DOM; marker callouts and `cover-view` / `cover-image` style overlays are safer than arbitrary positioned `view` / `image` elements over the map on mp-weixin.

## Goals / Non-Goals

**Goals:**

- Show a cover preview near the selected marker after the user taps a map marker.
- Add nullable `cover_url` to the public marker response and keep provider behavior aligned across mock, Koa, CloudBase function, and CloudBase live provider paths.
- Preserve the map page's marker-driven selected state and avoid detail fetches just to render the selected marker preview.
- Keep markers selectable and navigable when `cover_url` is `null`.
- Preserve public contract boundaries by excluding gallery arrays, external media arrays, cover source metadata, full address bodies, intro bodies, and navigation objects from marker payloads.

**Non-Goals:**

- Do not add map marker clustering, map viewport fitting, new filtering, or new map providers.
- Do not add a separate media endpoint or prefetch place details from the map page.
- Do not change admin cover management, file upload behavior, CloudBase storage policy, or external media attribution rules.
- Do not introduce a new mini program UI library.

## Decisions

1. Treat `cover_url` as marker-safe preview data.

   `cover_url` is already public on list and detail surfaces and is a single nullable URL, not a gallery or media ownership structure. Adding it to `PlaceMapMarkerSchema` gives the map page enough data for a visual preview while keeping the endpoint bounded. Alternatives considered:

   - Fetch detail on marker tap: rejected because current map browsing requirements intentionally avoid detail fetches for selected-marker rendering and this would add latency on a high-frequency interaction.
   - Reuse list results as a local cover cache: rejected because the map page should not depend on list filters, paging state, or a second endpoint to display selected markers.
   - Add a dedicated marker preview endpoint: rejected as unnecessary surface area for one lightweight field already maintained on the place record.

2. Render a selected-marker preview with map-compatible layering.

   The implementation should prefer a `cover-image` / `cover-view` overlay anchored within the map container or a selected marker/callout strategy supported by uni-app and mp-weixin. The preview must be visually tied to the selected marker and must not obscure core map interactions more than necessary. If exact geo-to-screen anchoring is not reliable on H5 or mp-weixin, the implementation may place the preview at a stable position adjacent to the selected marker callout while retaining the below-map summary as the accessible fallback.

   Alternatives considered:

   - Ordinary absolutely positioned `image` over `<map>`: risky on mini program native map layers.
   - Replacing marker icons with remote cover images: risky because marker icon sizing/cropping and remote image availability differ by platform; it also weakens the map pin affordance.

3. Keep existing selected summary and navigation behavior.

   The cover preview is an enhancement, not a replacement for the existing summary card. The card continues to provide localized name, category, recommendation state, detail CTA, and navigation CTA. This keeps no-cover places, image load failures, and accessibility fallback behavior stable.

4. Test contract boundaries before UI behavior.

   Shared schema and provider tests should prove `cover_url` is returned and detail-only fields are still stripped. Mobile typecheck and H5/mp-weixin GUI validation should then prove marker tapping renders the cover preview and preserves detail navigation.

## Risks / Trade-offs

- [Risk] Native map layering behaves differently between H5 and WeChat Mini Program. -> Mitigation: use map-compatible `cover-view` / `cover-image` patterns where needed, keep the below-map summary as a fallback, and require GUI validation for both H5 and mp-weixin when implementation is complete.
- [Risk] Returning `cover_url` from markers may be mistaken as opening the door to gallery/media expansion. -> Mitigation: update specs and tests to explicitly allow only nullable `cover_url` while forbidding gallery arrays, external media arrays, cover source metadata, address bodies, intro bodies, and navigation objects.
- [Risk] Remote or expired cover URLs can fail to render. -> Mitigation: treat `cover_url` as nullable/fallible UI data, show no-cover fallback without blocking selection or navigation, and do not add retries or detail fetches as part of this change.
- [Risk] Larger marker payloads can marginally increase map load size. -> Mitigation: add only one nullable string and avoid any gallery or attribution structures.

## Migration Plan

1. Update shared marker schema/types and tests to include nullable `cover_url`.
2. Update mock and CloudBase providers to map `place.cover_url` into marker responses.
3. Update mobile map rendering to display the selected marker cover preview and no-cover fallback.
4. Update API docs to list `cover_url` in marker payloads and reaffirm excluded detail fields.
5. Run focused shared/API tests, mobile typecheck, OpenSpec validation, and GUI verification for marker tap behavior.

Rollback is straightforward: remove the UI preview, remove `cover_url` from marker mappers and schema, and restore marker contract tests. Because this is additive at the API level, older clients that ignore `cover_url` are unaffected.

## Open Questions

- Should the selected cover preview show only the image, or include a compact localized name overlay for no-callout states? Default assumption: keep the existing marker callout/name and use the cover preview as image-only visual reinforcement.
- Should image source attribution appear on the map when `cover_url` comes from an external source? Default assumption: no; source attribution remains detail-only through `cover_source`, and the marker endpoint must not expose attribution metadata.
