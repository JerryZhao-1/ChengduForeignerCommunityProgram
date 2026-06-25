# 2026-06-24 Release Readiness Handoff

## Scope

This handoff freezes the dev integration entry state for the 2026-06-24 all-module smoke window. It does not claim production readiness, Mini Program trial readiness, or non-places live persistence.

## Entry Points

| Item | Value | Status |
| --- | --- | --- |
| CloudBase dev env id | `cloud1-d7gxdk8t43bd639c0` | verified dev target |
| CloudBase region/name | `ap-shanghai` / `cloud1` | verified dev target |
| API function | `community-map-api` | CloudBase HTTP function |
| API route prefix | `/api` | created |
| Dev API base | `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` | `/health` returned 200 |
| Admin hosted URL | `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/` | deployed and root/SPA route returned 200 |
| Mini Program app id | `wx7518a3c1fcdd39a5` | configured |
| Mini Program import path | `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin` | build passed |
| Mini Program API mode | `cloudbase-function` | build passed |
| Mini Program CloudBase function | `community-map-api` | build env embedded |
| Mock/admin actor | `user_001` | local/mock admin actor only |
| Storage prefix for place gallery | `public/places/{place_id}/` | recorded, real file id still blocked |

## Validation Results

| Evidence | Result |
| --- | --- |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0002__task-1.1__ref-R1__20260624T000100Z/` | `.cloudbase` generated output ignored by source lint; `pnpm lint` passed |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0003__task-1.2__ref-R2__20260624T000200Z/` | `pnpm typecheck`, `pnpm test`, and `pnpm lint` all exited 0 |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0004__task-2.1__ref-R3__20260624T000300Z/` | Mini Program `cloudbase-function` build passed |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0005__task-2.2__ref-R4__20260624T000400Z/` | WeChat DevTools import blocked; CLI service port disabled and GUI import not verified |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0006__task-2.3__ref-R5__20260624T000500Z/` | Real-device places map/navigation/share blocked; no physical device evidence channel |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0007__task-3.1__ref-R6__20260624T000600Z/` | Admin hosting blocked; hosted root and `/places` returned 404, API health returned 200 |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0011__task-3.1__ref-R6__20260624T134916Z/` | Admin hosting deployed; root and `/places` returned 200, `/api/health` returned 200, bundle targets the CloudBase dev API base |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0012__task-2.2__ref-R4__20260624T134916Z/` | WeChat DevTools service port import passed; home, events, discover, and places entries reached in simulator; preview QR generated |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0013__task-2.3__ref-R5__20260624T134916Z/` | Real-device preview QR generated; physical-device map/navigation/share evidence remains pending |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0015__task-2.3__ref-R5__20260624T140500Z/` | iPhone 14 Pro verified app launch, places list, and places map reachability; map showed `Can't find variable: URL`; mobile requester URL parsing was fixed and a new preview QR was generated for retest |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0016__task-2.3__ref-R5__20260624T141000Z/` | Real-device retest classified share failure as Mini Program certification/platform limitation; detail map-position button was made tappable and a new preview QR was generated for retest |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0017__task-2.3__ref-R5__20260624T151700Z/` | Real-device screenshot showed `查看地图位置` still inert; root cause identified as using `navigateTo` for a tabBar page; detail now uses `switchTab` with a stored focus place id and a new preview QR was generated |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0019__task-2.3__ref-R5__20260625T000500Z/` | Real-device map-position retest passed: `查看地图位置` opens the Places map page and the map displays `CloudBase Dev 验收点位`; share remains an accepted Mini Program certification limitation; native navigation or permission fallback was still pending until run `0021` |
| `auto_test_openspec/complete-june22-june23-release-readiness/run-0021__task-2.3__ref-R5__20260625T001000Z/` | User-confirmed final real-device retest passed native navigation or accepted runtime permission fallback; task `2.3` is accepted with share remaining a Mini Program certification limitation |

## Data Classification

No production data was mutated by this handoff.

| Data class | Classification | Action |
| --- | --- | --- |
| Imported volunteer places | 19 dev records, all `status="draft"` | Preserve as review fixtures; do not treat as production data |
| Published acceptance place | `CloudBase Live Acceptance Place`, id `place_0dc2aece-6aa6-46c5-8971-57646636a22a` | Preserve as dev smoke fixture |
| Draft visibility fixture | `place_d6af35be-acea-41b8-92ed-cfd0fa909072` | Preserve as draft public-denial evidence |
| Incomplete gallery/media references | Published acceptance place has `gallery_file_ids: []`; no real `cloud://` gallery file id is attached | P0 blocker for gallery media live acceptance |
| Invalid/missing coordinate imports | Imported draft records may include placeholder out-of-range coordinates for schema validity | Preserve in draft; map marker filtering must continue excluding them |
| Duplicate/test records | No deletion performed in this run | Review before production seed creation |
| CloudBase `file_assets` live data | No accepted real gallery media evidence | Do not claim files live provider readiness |

## Live/Fallback Boundaries

- Places live provider is accepted only for public list, map markers, detail, admin create/update, published visibility, and draft denial in the dev environment.
- Events, discover, auth, files, notifications, comments, announcements, and non-places flows may respond through the CloudBase handler, but remain fallback/parity evidence unless separate live provider evidence exists.
- `mock` and `user_001` are local/dev testing aids, not production authentication.
- `apps/api/.cloudbase/` is generated deployment output. It is excluded from source lint; deployability is checked by CloudBase build/smoke evidence.

## Blockers

| Priority | Blocker | Owner | Next action / window | Can 6.24 integration proceed around it? |
| --- | --- | --- | --- | --- |
| P0 | Real CloudBase gallery media/temp URL not accepted | CloudBase/files owner | Attach real `cloud://` file id under `public/places/{place_id}/` and verify `gallery_media`/`gallery_urls` | Places without gallery can proceed; gallery release gate cannot |
| P0 | Production env/security rules not configured | release owner | Create/confirm prod env and apply DB/storage rules before production release | Dev integration can proceed; production release cannot |
| P1 | `operation_logs` and production-grade log workflow incomplete | API/ops owner | Define write path and runbook for key business operations | Smoke can proceed with requestId/function logs |

## 6.24 Go/No-Go

Go for 6.24 dev API and local all-module smoke:

- `pnpm typecheck`, `pnpm test`, and `pnpm lint` passed.
- Dev API base is reachable.
- Mini Program build artifact exists for import.
- WeChat DevTools import and main simulator entries passed after enabling service port.
- Admin hosting now loads the dev bundle and uses the CloudBase dev API base.
- Data fixtures and live/fallback boundaries are documented.

No-go for release candidate or Mini Program trial signoff:

- Gallery media, production env, and production security rules remain incomplete.
