## Context

Once discover has durable content, governance, and module links, the remaining product gap is community engagement and operator prioritization. Current likes, favorites, follows, share counts, profile stats, and featured content are local UI state or hardcoded. Admin analytics and content operations are absent.

## Goals / Non-Goals

**Goals:**
- Persist likes, favorites, follows, and share counts.
- Provide real profile pages with stats and visible user content.
- Support content operations: pinned, featured, recommended, official posts, tag taxonomy, and ranking inputs.
- Add discover operations analytics and admin workload metrics.
- Implement CloudBase live provider support for social/ops collections.

**Non-Goals:**
- Multi-community platformization.
- External recommendation engines or personalized ML ranking.
- Full private messaging.

## Decisions

1. Store social state as per-user relationship records plus denormalized counters.

   Relationship records support idempotent toggles and user-specific state; counters keep public lists fast. Provider writes must update both consistently.

2. Keep profile public payloads separate from auth session payloads.

   Auth owns the current actor. Public profile summaries expose only display-safe fields, counts, and visible content according to user status and privacy.

3. Treat content operations as admin metadata on posts plus tag taxonomy records.

   `is_pinned`, `is_featured`, `is_recommended`, `is_official`, rank, and tag definitions provide enough control for the current single-community scope without creating a campaign system.

4. Build analytics from stored events/counters, not front-end approximations.

   Admin analytics should read provider-backed aggregates for post/comment/report volume, moderation time, active authors, popular associated places/events, and pending workload.

## Risks / Trade-offs

- [Risk] Counter drift between relationships and denormalized fields. -> Add idempotent APIs and focused consistency tests.
- [Risk] Social notifications can become noisy. -> Define only required notification triggers and allow future preference controls.
- [Risk] Analytics queries may be expensive in CloudBase. -> Start with bounded time windows and documented indexes.

## Migration Plan

1. Add shared social/profile/content-ops/analytics contracts.
2. Add provider methods and mock/CloudBase collections with indexes.
3. Update mobile detail/profile/home/notifications surfaces.
4. Add admin content operations and analytics views.
5. Update docs/tests and validate live provider evidence or blockers.
