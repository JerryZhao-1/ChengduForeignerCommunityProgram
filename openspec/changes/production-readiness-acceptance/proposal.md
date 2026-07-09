## Why

The 2026-07-09 local end-to-end run proved the Admin, Mobile H5, Mini Program simulator, Events API, Discover API, and Places public API can work in a local mock-backed loop. It also left production acceptance gaps that cannot be treated as release-ready evidence: `pnpm test` and `pnpm lint` still fail, the Mini Program preview was served from local/dev paths, true-device validation is incomplete, fixture media returns 404, and Places sharing on a real Mini Program device currently falls back to copying `/pages/places/detail?id=place_002` instead of opening a native share flow.

Production readiness needs one explicit acceptance change that separates local smoke evidence from production-like release evidence, fixes or classifies blockers, and defines the manual/CLI proof required before upload, review, or public rollout.

## What Changes

- Add a production acceptance gate that distinguishes local, CloudBase/dev, staging, and production-like evidence.
- Require `pnpm typecheck`, `pnpm test`, and `pnpm lint` to pass, or to record scoped blockers that prevent production acceptance.
- Require a reachable production-like Mini Program API target through CloudBase function mode or an HTTPS domain accepted by WeChat platform configuration; local `127.0.0.1`, LAN IP, and mock-only data are not sufficient for production acceptance.
- Require true-device Mini Program validation for Home, Events, Discover, Places, and Me on the supported device set, with evidence and console/API error capture.
- Tighten Places share acceptance so the "share" action either invokes native WeChat sharing through the Mini Program surface or is explicitly presented as a copy-link fallback; a hidden copy fallback behind a share label is not production-ready.
- Extend Events acceptance to include true-device browse, registration, ticket lookup, my registrations, and Admin check-in evidence.
- Extend Discover acceptance to include true-device feed/detail, post creation, comments, like/favorite/share/report, Admin governance evidence, and protection against interaction state overwrites.
- Require release data/media/config cleanup: no `example.com` fixture asset errors in production previews, map/navigation keys and legal domains configured, and DevTools import path documented or repaired.
- Produce a handoff bundle that classifies passed items, blockers, known platform limits, account/permission dependencies, and remaining manual confirmation.

## Capabilities

### New Capabilities

None. This change hardens existing release, Mini Program, Places, Events, Discover, and CloudBase deployment capabilities.

### Modified Capabilities

- `release-readiness-gate`: Adds the production acceptance gate, evidence classification, quality command requirements, and handoff criteria.
- `mini-program-release-readiness`: Adds production-like API target, true-device tab/module acceptance, legal domain checks, and platform capability validation.
- `places-interaction-closure`: Tightens Places share/navigation acceptance, including the native-share versus copy-link fallback decision.
- `events-integration-readiness`: Adds true-device Events user flow and Admin check-in production acceptance evidence.
- `discover-integration-readiness`: Adds true-device Discover content/governance acceptance and interaction-state integrity expectations.
- `cloudbase-dev-api-deployment`: Requires CloudBase/dev deployment evidence to be clearly promoted or rejected for production acceptance instead of being conflated with local smoke evidence.

## Impact

- Affected apps: `apps/mobile`, `apps/admin`, `apps/api`.
- Affected shared contracts/tests: `packages/shared`, especially integration readiness tests and mock/provider behavior used by release validation.
- Affected operational surfaces: WeChat DevTools, Mini Program true-device preview, CloudBase function or HTTPS API deployment, Tencent Map/domain configuration, storage/media assets, and release evidence under `output/` or docs.
- Evidence basis: local manual test bundle `output/manual-test/20260709-local-e2e/summary.md` plus true-device finding that navigation can launch but the Places share button only copies `/pages/places/detail?id=place_002`.
- Risk: WeChat account certification, share-menu permission, legal domain review, CloudBase environment readiness, and iOS/Android behavior may block production acceptance even when local H5/simulator tests pass.
