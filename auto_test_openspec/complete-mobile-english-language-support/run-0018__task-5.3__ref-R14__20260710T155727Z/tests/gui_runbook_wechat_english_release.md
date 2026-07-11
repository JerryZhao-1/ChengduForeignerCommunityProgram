# WeChat DevTools and true-device English release runbook

1. Import `apps/mobile/dist/build/mp-weixin`; record DevTools version, app id, package path/version, compile success, and network/API target. Do not use `dist/dev/mp-weixin`.
2. Clear storage/cache on a clean English-device profile. Launch and record initial locale; if device-locale simulation is unavailable, record the blocker explicitly.
3. Select English, verify titles and all five Tabs, terminate/relaunch, and verify persistence.
4. Exercise complete Home, Events list/detail/signup/ticket, Discover feed/create/comment/social/report, Places list/map/detail/native navigation/share/fallback, and Me/profile/notifications/registrations/language flows.
5. Record location/media/share permissions, legal-domain behavior without debug bypass, request target, console/network errors, tested record ids, and fallback decisions.
6. Repeat representative checks on physical iOS and Android; record device model, OS, WeChat version, package version, screenshots/logs, result, and owner notes separately.
7. Obtain a real production-candidate export with environment, timestamp, collections/query and counts. Run `scripts/bilingual-content-audit.ts`; require 0 blocking, 0 editorial and `releaseEligible=true`.
8. If any evidence is absent, leave task 5.3 unchecked and record severity, owner, and next action. Fixture-only evidence must fail.
