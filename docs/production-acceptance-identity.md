# Production Acceptance Identity Classification

Date: 2026-07-09

This document classifies identity and role handling for the production-readiness acceptance work. It is intentionally separate from API examples so that release evidence does not treat local mock behavior as production authentication.

## Current Production-Like Target

- Environment: CloudBase dev environment `cloud1-d7gxdk8t43bd639c0`.
- API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.
- Mini Program acceptance API mode: `cloudbase-function`.
- Function: `community-map-api`.
- Data provider: CloudBase live provider for Places, Events, Discover, files, and governance collections where implemented.

## Identity Classification

| Surface | Identity mechanism | Acceptance classification |
| --- | --- | --- |
| Local API and H5 development | `x-mock-user-id` from local scripts or `VITE_MOCK_ACTOR_ID` | Local/dev only. Not production authentication. |
| CloudBase Mini Program user flows | WeChat/CloudBase injected `x-wx-openid` and `x-wx-appid`, mapped to durable `users` records | Accepted production-like identity path for user-owned Mini Program actions such as Discover posting, comments, reports, follows, and event registration. |
| CloudBase dev admin smoke | Documented dev mock actor header `x-mock-user-id` using `user_001`, only when `API_ALLOW_MOCK_ACTOR_HEADER=true` | Allowed only for declared dev/admin smoke evidence. Not sufficient for public Admin launch. |
| Public Admin launch | Durable operator identity and `role_flags` assigned outside mock actor headers | Required before public Admin launch. This remains separate from Mini Program user identity. |

## Accepted Operator Path For This Change

For `production-readiness-acceptance` task 2.1 and 2.2, role-sensitive Admin smoke checks may use these declared dev actors only when `API_ALLOW_MOCK_ACTOR_HEADER=true`:

- Admin operator: `user_001`, sent as `x-mock-user-id: user_001`.
- Member user: `user_002`, sent as `x-mock-user-id: user_002`.

This is an accepted operator path only for CloudBase dev acceptance evidence. The header must be declared in the bundle `inputs/target.json` or equivalent evidence file. Any acceptance evidence that silently depends on `x-mock-user-id` without documentation is invalid.

## Production Blocker

Mini Program user-owned actions now have a production-like WeChat identity path. Public launch remains blocked for Admin/operator access until these items are implemented and verified:

1. Admin roles are assigned through durable `role_flags` or an equivalent controlled role store.
2. Admin-only APIs reject unauthenticated and non-admin callers without relying on a mock actor header.
3. Account-owner WeChat legal-domain and certification settings are verified on true devices.

Until then, Admin-only acceptance can pass only as a dev CloudBase smoke check, not as final production authentication approval.
