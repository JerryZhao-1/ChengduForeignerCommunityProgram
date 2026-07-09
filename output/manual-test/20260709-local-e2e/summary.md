# 20260709 Local E2E Manual Test Summary

## Scope

- No source code changes were intended or retained.
- Evidence is stored under `output/manual-test/20260709-local-e2e/`.
- API, Admin, Mobile H5, and WeChat DevTools mini program simulator were exercised locally.

## Automated Checks

- `pnpm typecheck`: passed.
- `pnpm test`: failed.
  - `packages/shared/test/integration-readiness.spec.ts`: Discover post order expected ascending IDs but actual order was latest-first.
  - `apps/api/test/integration-readiness.spec.ts`: same Discover post order mismatch.
- `pnpm lint`: failed.
  - `packages/shared/src/mock/service.ts`: `_input` is assigned but never used.

## Local Services

- API health: `{"ok":true}` at `http://127.0.0.1:8787/health`.
- Admin: `http://127.0.0.1:5183/`
- Mobile H5: `http://127.0.0.1:5174/`
- WeChat DevTools opened generated mini program project from `apps/mobile/dist/dev/mp-weixin`.

## Main E2E Data

- Test place id: `place_s7hn1p`
- Test place name: `E2E人工测试点位-20260709-1408`
- Admin API create response: `logs/current-e2e-place-create.json`
- Public visibility response: `logs/current-e2e-place-public-visibility.json`
- Event registration id: `reg_i4igoy`
- Event ticket id: `ticket_76mpad`
- Discover post id: `post_vu6vhe`
- Discover comment id: `comment_6n2kin`
- Discover report id: `report_if8ivs`

## Result

- Admin core navigation loaded: Places, Events, Posts, Announcements, Files, Logs.
- Admin Places create/publish flow passed; current test place is visible as `published`.
- Public API visibility passed for places list, map markers, and detail.
- Mobile H5 loaded Home, Events, Discover, Places list, Places map, Places detail, and Me.
- WeChat mini program simulator loaded Home, Events, Discover, Places map, Places detail, and Me without white screen when importing the generated mp-weixin directory directly.
- Events API end-to-end flow passed: registration, my registrations, ticket lookup, admin registration list, and admin check-in.
- Discover API end-to-end flow passed: create post, create comment, set like/favorite, record share, submit report, and admin governance visibility.
- H5 evidence was added for event detail, signup, my registrations, Discover detail, create, and report pages.

## Known Limitations / Follow-up

- Root project import in WeChat DevTools failed with a DevTools compile error: `The "path" argument must be of type string. Received undefined`. Generated `apps/mobile/dist/dev/mp-weixin` import worked.
- Mini program console includes sample image 404 errors for `https://example.com/public/events/...`; these are fixture asset warnings, not API flow blockers.
- Mini program console includes `showShareMenu:fail banned`; share requires account/platform permission or true device confirmation.
- Native navigation/share and true device preview were not fully validated.
- H5/local map behavior can be limited when map keys are not fully configured.
- A concurrency risk was observed during parallel Discover interaction calls: like and favorite updates can overwrite the same interaction state if written concurrently. A follow-up serialized like call restored the expected final state.
