## Context

The product is organized around events, discover, and places, but discover currently behaves as an isolated feed. Posts only carry `location_text`; profile and author data are hardcoded in mobile pages; notifications do not reflect discover activity. This change connects discover to the rest of the community system without weakening existing visibility boundaries.

## Goals / Non-Goals

**Goals:**
- Allow posts to associate with one visible place, one visible event, both, or neither.
- Render association cards in post detail and creation flows.
- Show related discover posts on place and event detail pages.
- Trigger notifications for comments, moderation outcomes, report resolutions, and followed-user activity where the relevant upstream capability exists; report-resolution notifications require the durable report-case workflow from `harden-discover-governance-console`.
- Replace hardcoded discover author data with auth/profile backed summaries.

**Non-Goals:**
- Persistent likes/favorites/follows implementation beyond notification hooks needed by this slice.
- Admin recommendation/featured workflows.
- Changing places/events public field boundaries outside related-post summary needs.

## Decisions

1. Store associations on posts as nullable `place_id` and `event_id`.

   This matches the existing single-community scope and avoids a join-table until one post needs multiple places/events. Related post queries can index these fields directly.

2. Validate associations through provider boundaries.

   Public creation must reject associations to missing, unpublished, unavailable, or cross-community records. Admin tools can see association metadata but public related surfaces only show visible posts tied to visible modules.

3. Add lightweight related-post surfaces instead of embedding full feeds.

   Place/event detail should request a small related list with post cards and allow navigation to discover detail. This avoids pulling comments/media-heavy detail data into places/events payloads.

4. Route author display through auth/profile summaries.

   The post payload can include an author snapshot for efficient rendering, but profile pages and author cards should resolve from user/profile data instead of hardcoded maps.

## Risks / Trade-offs

- [Risk] Related posts can leak moderated content. -> Reuse public post visibility filters in every related query.
- [Risk] Associated event state changes after a post is created. -> Related event surfaces must hide posts when the event is no longer public, while post detail can still show a safe unavailable association state.
- [Risk] Notifications can duplicate later social features. -> Keep notification events explicit and idempotent per action target.

## Migration Plan

1. Extend post schemas and create inputs for associations and author summaries.
2. Add related post APIs for places/events and provider indexes.
3. Update mobile create/detail/places/events/profile/notifications surfaces.
4. Add notification creation points for comments and governance outcomes.
5. Update docs/tests for visibility, association validation, and notification ownership.
