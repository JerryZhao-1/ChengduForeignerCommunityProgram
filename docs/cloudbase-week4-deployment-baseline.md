# CloudBase Week 4 Deployment Baseline

Last updated: 2026-06-22

```text
Mini Program AppID: wx7518a3c1fcdd39a5
AppSecret reset: yes

CloudBase dev env id: cloud1-d7gxdk8t43bd639c0
CloudBase dev region: ap-shanghai
CloudBase dev env name: cloud1
CloudBase prod env id: pending
CloudBase prod region: pending

HTTP cloud function name: community-map-api
HTTP cloud function status: Active / HTTP / Nodejs18.15 / function id lam-igyxxjph
HTTP access dev domain: https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com
HTTP access prod domain: pending
API route prefix: /api
API route status: created / APIId 083b66e0-c43a-4af4-864f-f3a297353828

Admin hosting dev domain: https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com
Admin hosting prod domain: pending

dev collections:
- users: created
- places: created
- file_assets: created
- configs: created
- operation_logs: created

future collections recorded only:
- events: pending
- posts: pending
- comments: pending
- announcements: pending
- notifications: pending

places indexes:
- idx_places_community_status: created / community_id asc + status asc / non-unique
- idx_places_category_level_1: created / category_level_1 asc / non-unique
- idx_places_category_level_2: created / category_level_2 asc / non-unique
- idx_places_is_recommended: created / is_recommended asc / non-unique
- idx_places_recommended_rank: created / recommended_rank asc / non-unique

storage prefixes recorded: yes
- public/places/{place_id}/
- public/events/{event_id}/
- public/posts/{post_id}/
- private/tickets/{registration_id}/
- private/exports/{job_id}/

map manual verification:
- marker loading: pass
- marker selection: pass
- detail jump: pass
- detail navigation: pass
- tool/device: WeChat DevTools simulator, iPhone 15 Pro Max
- WeChat DevTools version: Stable 2.01.2510280
- notes: Project imports and opens `/pages/places/map`; marker loading and marker selection were verified. Detail jump enters `/pages/places/detail?id=<place-id>`. Detail navigation triggers the WeChat native location/map flow and shows the target place; the external `qqmap://` routeplan URL cannot be fully opened in the desktop simulator, which is accepted as a simulator limitation for Week 4.

code integration:
- Mini Program manifest AppID: configured in apps/mobile/src/manifest.json
- Mini Program CloudBase init env: cloud1-d7gxdk8t43bd639c0 when VITE_API_MODE=cloudbase-function
- mobile API modes: mock / http / cloudbase-function
- cloudbase-function target: community-map-api
- CloudBase provider live mode: available for places when CLOUDBASE_PROVIDER_MODE=live and CLOUDBASE_ENV_ID or TCB_ENV is set
- CloudBase provider fallback: mock provider when live mode is not explicitly enabled
```

## Execution Notes

- CloudBase MCP auth status was `READY` and bound to `cloud1-d7gxdk8t43bd639c0`.
- HTTP access service was already enabled; no `/api` or `/api/*` route was created because `community-map-api` is still an Event placeholder function.
- Static hosting was already enabled and online; no Admin build artifact was uploaded.
- Cloud storage was reachable and empty at the root; path rules were recorded only because no real files should be uploaded in this phase.
- Production CloudBase resources were not created or modified.
- `apps/api/src/providers/cloudbase/index.ts` now has a live `places` provider path for CloudBase NoSQL, while events/discover/files/notifications still use the mock fallback until their collections and security rules are ready.
- Production CloudBase environment creation is moved to Week 11 full-chain integration.
- `/api` route creation is moved to Week 8 and remains deferred until `community-map-api` is deployed as the formal HTTP function.

## Week 8 Update

Week 8 repo-side readiness is documented in `docs/week8-places-cloudbase-integration.md`.

Current CloudBase live status from the 2026-06-14 run:

- CloudBase MCP returned `AUTH_REQUIRED`; no environment was bound in the active tool session.
- `community-map-api` could not be queried or deployed from this thread.
- The `/api` route was not created or confirmed, because function verification did not succeed.
- Route creation remains gated on verifying `community-map-api` as the formal HTTP function entry for `apps/api/src/cloudbase.ts`.

No production CloudBase environment or production data was modified.

## 2026-06-22 Dev API Update

CloudBase MCP auth was restored and bound to `cloud1-d7gxdk8t43bd639c0`.

Live differences from the original Week 4 record:

- `community-map-api` is no longer an Event placeholder. It is now an HTTP function using `Nodejs18.15`, status `Active`, function id `lam-igyxxjph`.
- The function env vars are `API_PROVIDER=cloudbase`, `CLOUDBASE_PROVIDER_MODE=live`, and `CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`.
- The `/api` access route exists at `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.
- Dev smoke passed for `/api/health`, `/api/places`, and `/api/places/map-markers`.
- The live `places` collection exists but currently has `0` documents, so detail smoke remains blocked until a published live place exists.

Full evidence is recorded in `docs/cloudbase-dev-api-deployment.md`.
