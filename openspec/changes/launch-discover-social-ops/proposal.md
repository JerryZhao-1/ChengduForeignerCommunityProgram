## Why

After the core content, governance, and cross-module links exist, Discover still needs real social state and operator tooling to become useful as a community channel. Current likes, favorites, follows, share counts, profile stats, featured content, and analytics are local or hardcoded.

## What Changes

- Add persistent post interactions: like/unlike, favorite/unfavorite, share count tracking, and stable interaction counts in list/detail payloads.
- Add follow/unfollow relationships and real profile pages with profile data, stats, posts, videos, followed state, and public/private visibility rules.
- Add content operations: pinned, featured, recommended, official posts, tag taxonomy maintenance, and homepage/discover ranking inputs.
- Add operations analytics: post/comment/report volume, moderation processing time, popular associated places/events, active authors, and admin pending workload.
- Add notification integration for followed-user posts and interaction-driven events where appropriate.
- Ensure CloudBase live provider supports the social/ops collections and that docs distinguish verified live scope from fallback behavior.

## Capabilities

### New Capabilities
- `discover-social-ops`: Persistent social interactions, follows, real profiles, content operations, analytics, and live CloudBase scope.

### Modified Capabilities
- `discover-integration-readiness`: Post list/detail behavior now exposes durable interaction counts and operational ranking state.
- `files-auth-notifications-readiness`: Notification readiness includes follow and interaction notification cases.
- `admin-hosting-api-readiness`: Admin dashboard readiness includes discover content operations and analytics views.
- `cloudbase-dev-api-deployment`: Live provider readiness extends to discover social and operations collections after evidence-backed verification.

## Impact

- Shared schemas/contracts/types for interactions, follows, profile summaries, content operations, tags, and analytics.
- API discover/profile/notifications/admin routes and providers.
- Mobile discover detail, profile, home, notifications, and relevant list surfaces.
- Admin discover operations dashboard and analytics pages.
- CloudBase collections/indexes/security assumptions, docs, and focused validation.
