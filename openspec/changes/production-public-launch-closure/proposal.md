## Why

The current production-readiness evidence supports supervised CloudBase dev acceptance, but it explicitly blocks public launch on Admin production identity, WeChat account/domain confirmation, true-device evidence, and production content cleanup. This change closes the gap between "production-like acceptance" and a defensible Mini Program public launch decision by separating Codex-owned automation from account-owner/manual work and making the final release gate reproducible.

## What Changes

- Add a public-launch closure gate that classifies every remaining launch prerequisite as Codex-owned, human-owned, or mixed ownership.
- Harden production Mini Program build validation so public-release artifacts do not include local API endpoints, mock actor headers, fixture media, or ambiguous DevTools import paths.
- Require an extremely detailed human operations document under `docs/` for WeChat account setup, legal domains, privacy settings, CloudBase console checks, true-device evidence collection, review submission, release, rollback, and post-release monitoring.
- Require Codex-generated validation bundles for production build scans, Admin production auth checks, CloudBase target checks, media/content audits, and manual evidence indexing.
- Extend Mini Program release readiness from dev/production-like acceptance to public-review readiness, including iOS and Android true-device evidence.
- Extend Admin/API readiness so public launch requires non-mock Admin authentication and role verification with mock actor headers disabled.
- Extend the release gate so final handoff can state one of: blocked, ready for WeChat review upload, ready for review submission, ready for phased release, or ready for full public release.
- No breaking API contract changes are intended; any implementation change that alters shared API payloads must update `packages/shared` first.

## Capabilities

### New Capabilities

- `production-public-launch-closure`: Final public launch closure process covering ownership classification, production artifact checks, human operations documentation, evidence indexing, release decision states, and post-release monitoring readiness.

### Modified Capabilities

- `mini-program-release-readiness`: Extend Mini Program readiness from CloudBase dev build/import/real-device places verification to public-review package readiness, legal-domain evidence, complete tab/device coverage, and release artifact scans.
- `admin-hosting-api-readiness`: Extend Admin readiness to require production Admin login, Bearer-protected admin APIs, durable admin role data, and mock actor header rejection in live production mode.
- `release-readiness-gate`: Extend the release gate with explicit public-launch decision states, required evidence links, and blocker ownership before upload, review submission, phased release, or full release.

## Impact

- `apps/mobile`: production Mini Program build configuration, artifact scanning, DevTools import documentation, and any required removal of local fallback strings from release artifacts.
- `apps/admin`: Admin login/readiness documentation and any production-mode checks needed to prove hosted Admin uses the intended API target.
- `apps/api`: Admin auth, CloudBase live provider role resolution, mock actor gating, production environment checks, and validation scripts.
- `packages/shared`: only affected if a new or changed API contract is required by implementation.
- `docs/`: new detailed human launch manual and updated release handoff/status documentation.
- `scripts/` and `auto_test_openspec/`: reproducible build scans, CloudBase/API smoke checks, content/media audits, and evidence bundles.
- External systems: WeChat Mini Program public account, WeChat DevTools or `miniprogram-ci`, CloudBase environment, CloudBase database/storage/security rules, Tencent/Amap map keys, legal request/upload/download domains, and true iOS/Android WeChat clients.
