## Why

Discover is currently isolated from places, events, notifications, files, and user identity. Community posts should help residents discuss specific places and activities, and the system should notify affected users when discussion or moderation state changes.

## What Changes

- Add first-class `place_id` and `event_id` association support to discover posts, including validation against visible community records.
- Let users attach a place or event while creating posts, and render place/event cards in post detail.
- Add related discover sections on place detail and event detail so places/events can surface community discussion, recaps, and Q&A.
- Add discover notifications for new comments/replies, moderation outcomes, governance-backed report resolutions, followed-user activity, and cross-module discussion updates.
- Connect discover author data to authenticated user/profile data instead of hardcoded author maps.
- Ensure associated posts respect each module's visibility rules: unpublished places/events and moderated posts must not leak through cross-module surfaces.

## Capabilities

### New Capabilities
- `discover-community-module-links`: Cross-module discover associations with places, events, notifications, files, and auth/profile boundaries.

### Modified Capabilities
- `discover-integration-readiness`: Post creation, list, detail, and visibility behavior now include optional place/event associations.
- `places-mobile-experience`: Place detail can show related discover posts without leaking unpublished or moderated content.
- `events-integration-readiness`: Event detail can show related discover posts, activity discussion, and recap/question flows.
- `files-auth-notifications-readiness`: Notification readiness now includes discover-triggered notifications.

## Impact

- Shared schemas/contracts for post association inputs, related post queries, and notification payloads.
- API discover, places, events, notifications, auth/profile provider boundaries.
- Mobile discover create/detail, places detail, events detail, notifications, and profile pages.
- Admin moderation impact on cross-module related content.
- API docs and focused shared/API/mobile validation.
