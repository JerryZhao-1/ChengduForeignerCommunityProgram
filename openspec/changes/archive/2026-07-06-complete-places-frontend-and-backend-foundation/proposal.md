# Change: Complete places frontend and backend foundation

## Why

Current `places` mobile pages are placeholder-level and do not meet the product definition in the phase design docs. At the same time, the backend and admin layers still rely on partial mock-mode assumptions and do not yet provide a stable integration foundation for `places`, `events`, and `discover`.

The project needs one coordinated change that treats `places` frontend as a true 0-to-1 build while also hardening the shared contracts, BFF behavior, and minimum admin workflows required to supply and operate real content.

## What Changes

- Complete the `places` mobile experience beyond placeholder pages
- Add places filtering, recommendation entry points, gallery-backed detail rendering, and stable navigation/share/favorite-ready UX
- Expand places backend contracts and provider behavior to support list, detail, marker, filter, recommendation, and admin maintenance flows
- Add minimum usable admin support for places creation, editing, categorization, recommendation, and gallery management
- Harden shared/backend foundations needed for team-wide integration, including provider parity, route coverage, and minimum admin support for `events` and `discover`
- Treat the existing `add-places-map-browsing` change as a subset of this broader foundation effort

## Impact

- Affected specs:
  - `places-mobile-experience`
  - `places-admin-management`
  - `backend-integration-foundation`
- Affected code:
  - `apps/mobile/src/pages/places`
  - `apps/api/src/**`
  - `apps/admin/src/**`
  - `packages/shared/src/**`
