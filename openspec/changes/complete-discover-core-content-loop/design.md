## Context

Discover currently exposes a launch baseline: public post list/detail, create post, create comment, report post, and admin moderation. Mobile detail still renders hardcoded comments and local interaction counts, create uses pasted media URLs, `my-posts` is an entry placeholder, and CloudBase live provider does not persist discover data. This change establishes the durable content model that later governance, cross-module linking, and social operations will build on.

## Goals / Non-Goals

**Goals:**
- Make comments readable and durable across refreshes.
- Add owner-centric post browsing through a current-user posts endpoint.
- Extend post payloads with timestamps, counters, author display snapshot, and nullable `place_id` / `event_id` association fields.
- Replace URL-only post media entry with file upload, completion, and binding through existing `public/posts/` rules.
- Implement discover posts/comments/media binding in CloudBase live provider with provider parity against mock.

**Non-Goals:**
- Full report case management, user punishment, comment governance, or admin audit logging.
- Persistent likes, favorites, follows, recommendations, or analytics.
- Cross-module related post rendering on place/event detail pages.

## Decisions

1. Keep `PostSchema` as the primary public payload, but expand it conservatively.

   The existing pages and clients already consume `Post`. Adding nullable association fields and numeric counters avoids creating a parallel list/detail DTO too early. Admin-only fields such as report summaries and moderation notes stay out of the public post payload.

2. Add explicit comment list/read contract instead of embedding all comments in post detail.

   Comments can grow faster than posts and need paging, visibility filtering, and later moderation. `GET /discover/posts/:id/comments` should return visible comments only and respect post visibility.

3. Add a current-user post list rather than overloading public search.

   `GET /discover/me/posts` can return the actor's visible, reported, hidden, or pending-owned posts according to owner visibility rules without leaking that behavior into public list.

4. Bind post media through file assets and post fields.

   The UI may still support URL preview in dev, but production-intent creation should use `files.createUploadRequest` / `files.complete` and submit `image_file_ids` plus derived public URLs or provider-resolved URLs.

5. Treat CloudBase discover live persistence as part of this foundation.

   Later changes cannot be considered production-ready if core posts/comments still fall back to process memory. This change should add `posts`, `comments`, and relevant `file_assets` usage to live provider scope and document indexes/security assumptions.

## Risks / Trade-offs

- [Risk] Existing mock data lacks new fields. -> Backfill fixtures and provider normalization with deterministic defaults.
- [Risk] Comment reads can expose comments for moderated posts. -> Route/provider must check post launch visibility before returning comments.
- [Risk] File upload flows differ between H5 and Mini Program. -> Keep shared client contracts stable and implement platform-specific upload glue in mobile only.
- [Risk] CloudBase collections may be absent in dev. -> Validation must record blocked live evidence rather than silently claiming live completion.

## Migration Plan

1. Extend shared schemas/contracts/client and mock fixtures.
2. Add API routes and provider methods for comments and current-user posts.
3. Add CloudBase live discover provider with collection reads/writes and indexes documented.
4. Update mobile discover pages to consume real comments, media upload, and user-owned posts.
5. Update docs/tests and validate mock, local HTTP, and CloudBase live or blocked evidence.
