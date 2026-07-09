## Overview

The implementation keeps the existing API envelope and user schema. In CloudBase live mode, the trusted identity source becomes the Mini Program request headers injected by `wx.cloud.callHTTPFunction`: `x-wx-openid`, `x-wx-appid`, and optional `x-wx-unionid`. The backend maps this identity to the existing `users` collection and returns the existing `AuthSession` shape.

## Backend Design

- Add `POST /auth/wechat-miniapp/session` to create or refresh the caller's project user.
- In live CloudBase mode, `actorMiddleware` resolves actors from WeChat headers first. `x-mock-user-id` is accepted only when `API_ALLOW_MOCK_ACTOR_HEADER=true`.
- User ids are stable hashes derived from the Mini Program app id and openid, so raw openid is not used as the public `_id`.
- Existing local mock mode and H5 HTTP development keep their current mock actor path.

## Mobile Design

- `cloudbase-function` requester no longer sends mock actor headers.
- App launch calls the session endpoint after `wx.cloud.init`, then stores the returned user id.
- Discover tag creation serializes create attempts and falls back to selecting a freshly fetched existing tag when create returns a duplicate/race/auth-style error.
- Discover share uses native `open-type="share"` for MP-WEIXIN and copy-link fallback elsewhere. Share count is recorded from share lifecycle/copy success instead of merely opening the share sheet.

## Risks

- WeChat account certification remains an external platform blocker. Code can expose a working copy-link fallback, but cannot force native share to succeed on an uncertified account.
- Admin production authentication remains out of scope; dev/admin smoke may keep using the explicit mock fallback flag.
