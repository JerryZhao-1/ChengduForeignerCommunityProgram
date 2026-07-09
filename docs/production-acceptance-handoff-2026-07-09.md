# Production Acceptance Handoff - 2026-07-09

Change: `production-readiness-acceptance`

## Recommendation

Proceed with supervised production-like acceptance on the CloudBase dev target. Do not submit for public launch yet.

Public launch remains blocked by identity replacement, WeChat legal-domain/account confirmation, and true-device GUI evidence collection.

## Environment

| Item | Value |
| --- | --- |
| API target | `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` |
| CloudBase env | `cloud1-d7gxdk8t43bd639c0` |
| Cloud function | `community-map-api` |
| Mini Program mode | `cloudbase-function` |
| DevTools import path | `apps/mobile/dist/build/mp-weixin` |
| Admin Web | `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/` |
| Identity classification | Dev `x-mock-user-id` actors only; see `docs/production-acceptance-identity.md` |

## Completed Worker Evidence

| Run | Scope | Result |
| --- | --- | --- |
| `run-0001__task-1.1__ref-R1__20260709T065611Z` | root typecheck/test/lint | Passed |
| `run-0002__task-2.1__ref-R2__20260709T070257Z` | CloudBase API target and Mini Program config | Passed |
| `run-0003__task-2.2__ref-R3__20260709T080441Z` | identity classification and role checks | Passed |
| `run-0004__task-3.1__ref-R4__20260709T080744Z` | Places share static checks and GUI runbook | Passed CLI/static; GUI evidence pending |
| `run-0005__task-3.2__ref-R5__20260709T080951Z` | Places navigation fallback checks and GUI runbook | Passed CLI/static; GUI evidence pending |
| `run-0006__task-3.3__ref-R6__20260709T081119Z` | Mini Program tab/config static checks and GUI runbook | Passed CLI/static; GUI evidence pending |
| `run-0007__task-4.1__ref-R7__20260709T081335Z` | Events registration/ticket/check-in/repeat-check-in API smoke | Passed |
| `run-0008__task-5.1__ref-R8__20260709T081522Z` | Discover create/comment/interaction/report/Admin governance API smoke | Passed |
| `run-0009__task-5.2__ref-R9__20260709T081854Z` | Discover interaction overwrite hardening | Passed |
| `run-0010__task-6.1__ref-R10__20260709T082222Z` | production-preview media/config scan | Passed |

All evidence is under `auto_test_openspec/production-readiness-acceptance/`.

## Module Status

| Module | Status |
| --- | --- |
| Places | API, map marker, detail, share static behavior, navigation fallback code checks passed. True-device screenshots still pending. |
| Events | CloudBase API create/review/detail/register/ticket/admin registrations/check-in/repeat-check-in passed. GUI evidence pending. |
| Discover | CloudBase API create/comment/like/favorite/share/report/Admin governance passed. Interaction overwrite risk mitigated and verified. GUI evidence pending. |
| Admin | Hosted Admin URL is available; role-sensitive CloudBase checks passed with documented dev admin actor. Public production auth pending. |
| Mini Program | `cloudbase-function` build passed; generated DevTools project includes five tabs and CloudBase target. True-device tab matrix pending. |

## Device Matrix

| Device / Surface | Required Evidence | Status |
| --- | --- | --- |
| WeChat DevTools | tab screenshots, share/navigation events, network logs | Runbooks prepared; evidence pending |
| iOS WeChat true device | tab matrix, share, navigation, permission fallback | Required before public launch |
| Android WeChat true device | tab matrix, share, navigation, permission fallback | Required before public launch |
| Admin Web | event check-in and discover governance screenshots | Runbooks prepared; evidence pending |

## Known Blockers

1. Mini Program user identity now maps WeChat/CloudBase `x-wx-openid` / `x-wx-appid` to durable project users; Admin production authentication still requires a non-mock operator role path.
2. WeChat Mini Program legal domains and storage/media domains require account-owner confirmation.
3. True-device GUI evidence for iOS and Android is not yet collected.
4. WeChat account certification/share capability may limit native share behavior until account settings are complete.
5. Published production content must avoid mock fixture media and must use reviewed CloudBase/external media domains.

## Manual Test Entry Points

- Mini Program project: `apps/mobile/dist/build/mp-weixin`
- Admin Web: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`
- CloudBase API health: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health`
- GUI runbooks:
  - `auto_test_openspec/production-readiness-acceptance/run-0004__task-3.1__ref-R4__20260709T080744Z/tests/gui_runbook_places_share.md`
  - `auto_test_openspec/production-readiness-acceptance/run-0005__task-3.2__ref-R5__20260709T080951Z/tests/gui_runbook_places_navigation.md`
  - `auto_test_openspec/production-readiness-acceptance/run-0006__task-3.3__ref-R6__20260709T081119Z/tests/gui_runbook_mini_program_tabs.md`
  - `auto_test_openspec/production-readiness-acceptance/run-0007__task-4.1__ref-R7__20260709T081335Z/tests/gui_runbook_events_acceptance.md`
  - `auto_test_openspec/production-readiness-acceptance/run-0008__task-5.1__ref-R8__20260709T081522Z/tests/gui_runbook_discover_acceptance.md`
  - `auto_test_openspec/production-readiness-acceptance/run-0010__task-6.1__ref-R10__20260709T082222Z/tests/gui_runbook_config_media.md`
