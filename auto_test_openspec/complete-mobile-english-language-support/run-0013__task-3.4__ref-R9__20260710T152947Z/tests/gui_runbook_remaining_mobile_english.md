# MCP-only remaining Mobile English runbook

1. Select English and open Discover. Verify feed/search/sort/media/social labels are English while Chinese and English UGC remain unchanged with `Chinese`/`English` badges.
2. Open `post_001`; verify post/comment UGC remains Chinese and comments, actions, dates, input placeholder, report controls, and language badge are localized.
3. Visit create, search, and report routes. Verify fields, validation, reasons, loading/error/empty states, media controls, and feedback use the catalog.
4. Visit Me, profile, follows, favorites, likes, posts, comments, reports, and their detail routes. Verify navigation, counts, states, moderation/account labels, and follow/social actions are English.
5. Visit notifications as `user_001`; verify bilingual title/body select English, read state/action/date are English, and legacy presentation is nonblank by unit fixture.
6. Visit My Registrations; verify stable statuses and contact/attendee/ticket labels are English.
7. Visit Sign In and Language; verify no token is exposed, auth states are localized, selector labels both languages explicitly, and English is selected.
8. Smoke Chinese mode, restore English, save evidence screenshots, and confirm the page console has no errors or unhandled rejections.
