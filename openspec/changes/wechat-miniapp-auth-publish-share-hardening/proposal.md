## Why

Mini Program Discover posting currently still depends on dev mock actor behavior in the production-like CloudBase target. This makes user identity, tag creation, and content ownership unsafe for public launch. Native share can also surface WeChat account-certification limits that code cannot bypass, so the UI needs a clear fallback.

## What Changes

- Resolve CloudBase Mini Program callers from WeChat-injected `x-wx-openid` / `x-wx-appid` request headers and map them to durable project users.
- Add an explicit Mini Program auth session endpoint for account creation/refresh while keeping local mock actor behavior behind a dev-only flag.
- Stop sending `x-mock-user-id` from Mini Program CloudBase function mode.
- Harden Discover tag creation UX against duplicate/existing tags and clearer failure states.
- Align Discover detail sharing with native Mini Program share where available and copy-link fallback where platform certification blocks native share.

## Capabilities

### Modified Capabilities

- `cloudbase-dev-api-deployment`: CloudBase live auth now uses Mini Program WeChat identity instead of undocumented mock actor headers.
- `mini-program-release-readiness`: Mini Program production-like builds create/refresh user sessions through CloudBase function mode and classify share account limits.
- `discover-integration-readiness`: Discover post/tag/share flows use durable actor identity and recoverable share/tag fallback behavior.

## Impact

- Shared auth contracts, mobile API client, API auth middleware, CloudBase provider auth, Discover create/detail UI, API/mobile tests, and release docs.
