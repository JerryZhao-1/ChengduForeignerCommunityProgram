## Why

The current admin posts page can only list public posts and hide one row, while reports are collapsed into a post status with no evidence, case owner, history, comment moderation, or user enforcement path. Community discover needs an operator-grade governance console before real users can rely on it.

## What Changes

- Introduce report case records for posts and comments, including reason, reporter, target, evidence files, status, handler, resolution note, and timestamps.
- Add admin discover queues for all posts, reported posts, hidden/deleted posts, comments, report cases, users, and moderation audit history.
- Expand admin moderation actions to support hide, restore, delete, reject report, resolve report, warn user, mute user, ban user, and role review within clear permission boundaries.
- Add comment governance, including comment list/read, hide/delete/restore, comment report handling, and post detail comment review in the admin drawer.
- Add user governance for profile summary, post/comment history, report/violation history, warnings, mute/ban state, role flags, and admin notes.
- Add operation/audit logging for every moderation, report resolution, user enforcement, restore, and delete action.
- Replace the thin `PostsPage` with a real governance console: tabs, filters, detail drawer, batch operations, case handling, and audit evidence.

## Capabilities

### New Capabilities
- `discover-governance-console`: Admin-facing discover moderation, report case management, comment governance, user enforcement, and audit logging.

### Modified Capabilities
- `discover-integration-readiness`: Report and moderation behavior is expanded from status mutation to report case and audit-backed governance.
- `files-auth-notifications-readiness`: File rules are extended to support private/protected report evidence files and admin-readable evidence access.

## Impact

- Shared schemas/contracts/types for reports, comments, user governance, moderation actions, and audit records.
- API admin discover routes, provider types, mock provider, CloudBase provider, and auth role checks.
- Admin `PostsPage.vue` or new discover governance subviews.
- Mobile report page evidence upload and comment report entry points.
- API docs, operation logs docs, and focused API/admin validation.
