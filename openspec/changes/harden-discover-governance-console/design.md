## Context

Discover moderation currently mutates a post status and reloads a thin admin table. Reports are not durable cases, evidence is not uploaded, comments cannot be reviewed, user enforcement does not exist, and moderation history is not auditable. This change turns discover governance into an admin-owned workflow while preserving the public visibility rules established by the integration baseline.

## Goals / Non-Goals

**Goals:**
- Add report case records for posts and comments.
- Persist report evidence files and make them admin-readable under protected access rules.
- Provide admin queues for posts, comments, reports, users, and moderation audit history.
- Add moderation and user enforcement actions with explicit role checks.
- Make all governance state transitions auditable.

**Non-Goals:**
- Public social ranking, recommendations, follows, or analytics dashboards.
- Cross-module related content display for places/events.
- Automated ML moderation or external trust-and-safety vendor integration.

## Decisions

1. Model reports as cases, not as post-only status changes.

   A case can target a post or comment, carry evidence and handler metadata, and be resolved without requiring every report to hide content automatically. Public visibility still follows configured launch behavior.

2. Keep moderation actions explicit and append-only in audit records.

   Posts/comments/users may have mutable status fields for efficient reads, but every admin action must write an operation log entry with actor, target, action, reason, and timestamp.

3. Separate content governance from content operations.

   This change covers safety and maintainability: hide, restore, delete, report resolution, comment handling, and user enforcement. Pinned/recommended/featured content belongs to the later social/ops change.

4. Gate user enforcement by admin role and target constraints.

   Community admins can warn/mute/ban regular users in the active community; system-admin-only actions and role mutation rules should remain explicit if expanded.

## Risks / Trade-offs

- [Risk] Admin UI scope can become too large. -> Use tabs and detail drawers instead of creating unrelated dashboards in this slice.
- [Risk] Report evidence can leak private uploads. -> Use protected biz types, admin-only private URL access, and never include evidence in public payloads.
- [Risk] Hard delete can remove context needed for audit. -> Prefer status delete for public hiding and preserve audit/report records.

## Migration Plan

1. Add shared report/comment moderation/user enforcement/audit schemas and contracts.
2. Add provider methods and API routes with role checks.
3. Update mobile report/comment action entry points to create report cases and upload evidence.
4. Replace admin posts skeleton with governance queues, filters, drawers, batch actions, and audit display.
5. Update docs/tests and validate API/admin role and visibility behavior.
