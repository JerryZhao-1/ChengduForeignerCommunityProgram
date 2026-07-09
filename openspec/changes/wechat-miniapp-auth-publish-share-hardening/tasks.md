## 1. Backend Identity

- [x] 1.1 Add shared auth contract/schema/path for Mini Program session.
- [x] 1.2 Implement CloudBase live auth from `x-wx-openid` / `x-wx-appid`, durable user upsert, and dev-only mock fallback flag.
- [x] 1.3 Add API tests for WeChat session, missing identity 401, tag creation, and post author identity.

## 2. Mobile Behavior

- [x] 2.1 Stop sending mock actor headers in `cloudbase-function` mode and refresh session on app launch/login.
- [x] 2.2 Harden Discover tag creation with create-in-progress state, existing-tag fallback, and clearer errors.
- [x] 2.3 Align Discover share with native Mini Program share and copy fallback behavior.

## 3. Docs and Validation

- [x] 3.1 Update production identity/share documentation and API list.
- [x] 3.2 Run `pnpm --filter @community-map/api typecheck`, `pnpm --filter @community-map/mobile typecheck`, `pnpm test`, `pnpm lint`, and `openspec validate wechat-miniapp-auth-publish-share-hardening --strict --no-interactive`.
