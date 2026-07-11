# MCP-only complete bilingual H5 runbook

1. Open Language, choose English, verify document/native title, five Tab labels, page copy, and saved confirmation; reload and verify English remains selected.
2. Visit every path in `apps/mobile/src/pages.json` using the ids in `task.md`; save route snapshots and key Home/Events/Discover/Places/Me screenshots.
3. Verify English system copy, localized dates/statuses/actions, nonblank formal content, explicit empty/error/registered/map fallback states, and unchanged Chinese Discover UGC with a `Chinese` badge.
4. Choose Chinese and repeat all 27 routes; verify Chinese titles, Tabs, actions, dates/statuses, and usability.
5. Switch back to English and verify the browser document title and visible navigation update immediately, then reload to verify persistence.
6. Check browser logs for errors/warnings, unhandled rejections, map-key errors, cover/favicon 404s, Shared export errors, and vue-router deprecation.
7. Record any redirect, blocker, manual confirmation, and screenshot route mapping without using executable browser scripts.
