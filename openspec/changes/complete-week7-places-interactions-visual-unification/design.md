## Context

The Week 6 places work has made list, map, detail, filtering, recommendation, gallery-backed detail data, and admin-fed content usable. The remaining Week 7 gap is product closure: the detail page currently exposes favorite/share buttons as placeholder toasts, navigation launch behavior is local to the detail page, recommendation routing still has transitional copy, and visual styles are repeated across places pages.

The current OpenSpec change `complete-places-frontend-and-backend-foundation` already includes a broad places mobile experience spec. This Week 7 proposal narrows the next implementation pass to mobile interaction closure and visual unification, without changing backend contracts.

## Goals / Non-Goals

**Goals:**

- Make favorite behavior visibly stateful in v1 while keeping persistence optional.
- Make place detail sharing use the place detail share payload instead of placeholder copy.
- Centralize places navigation action handling so map/detail flows use one failure-feedback path.
- Remove placeholder wording and transitional surfaces from `apps/mobile/src/pages/places`.
- Align places list, map, detail, and recommendation entry behavior with one module-level visual language.
- Produce validation evidence for Mini Program share, location permission, and navigation behavior.

**Non-Goals:**

- Add a backend favorite API, database collection, or persistent cross-device favorite model.
- Add a new UI component library or replace the existing uni-app/TDesign-aligned styling approach.
- Redesign non-places modules.
- Complete Week 8 CloudBase full-chain integration.

## Decisions

1. Keep favorites as a frontend v1 seam.

   Favorite state will be visible to the user and may be stored locally if implementation needs persistence across page reloads, but it will not introduce a shared contract or backend provider in this change. This keeps Week 7 focused on product closure and avoids blocking Week 8 integration on a new data model.

   Alternative considered: add a persisted favorite backend now. This was rejected because the 12-week plan explicitly allows favorite to remain a v1 frontend seam if persistence would slow the core places release.

2. Use existing place detail `share` data for page sharing.

   Place detail already has a `share` payload. The mobile detail page should use that payload for Mini Program share title/summary where supported, falling back to the localized place name and intro. Placeholder share toasts should be removed or replaced by behavior-specific feedback.

   Alternative considered: create a new share API. This is unnecessary because the share payload is already part of the detail response surface.

3. Centralize navigation action behavior in a places helper.

   The current `places/navigation.ts` only builds page URLs. Week 7 should extend or split this helper so opening a location, deriving localized names/addresses, and handling failures are shared. This makes future location authorization handling and map provider fallback easier.

   Alternative considered: keep navigation inline in each page. This would repeat permission/failure handling as map and detail flows grow.

4. Treat visual unification as places-module cleanup, not a global design-system rewrite.

   Week 7 should improve shared places button/chip/card patterns and copy quality inside `apps/mobile/src/pages/places`, while avoiding broad refactors to unrelated mobile pages. This respects the current H5/mp-weixin compatibility constraint.

## Risks / Trade-offs

- Favorite state is local-only → Make button copy and code boundaries explicit so future persisted implementation can replace the state source without page restructuring.
- Mini Program share APIs differ from H5 behavior → Verify in mp-weixin/WeChat DevTools and keep H5 fallback behavior non-breaking.
- `uni.openLocation` permission behavior varies by device/simulator → Document expected permission prompt behavior and include failure feedback in the centralized helper.
- Visual cleanup can expand into unrelated refactoring → Limit scope to `apps/mobile/src/pages/places` and any tiny reusable helper/style extraction directly needed by those pages.
