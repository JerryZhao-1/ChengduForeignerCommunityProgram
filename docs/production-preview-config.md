# Production Preview Configuration

Date: 2026-07-09

This document records the production-preview configuration for the `production-readiness-acceptance` change.

## Mini Program Build

- Canonical WeChat DevTools import path: `apps/mobile/dist/build/mp-weixin`.
- API mode: `cloudbase-function`.
- API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.
- CloudBase environment: `cloud1-d7gxdk8t43bd639c0`.
- Cloud function: `community-map-api`.

The production-preview Mini Program build must not request local API endpoints (`localhost`, `127.0.0.1`, LAN IPs) or fixture event media such as `https://example.com/public/events/...`.

## Media URLs

- Event and place media for CloudBase live data should resolve through CloudBase storage file IDs and temporary URLs.
- `https://example.com/public/events/...` is allowed only in local mock/test fixtures and must not appear in production-preview build artifacts.
- External POI image candidates must preserve attribution metadata when used.

## Map And Domain Configuration

- Server-side map keys are configured only in the API or CloudBase function environment:
  - `TENCENT_MAP_KEY`
  - `TENCENT_MAP_SECRET_KEY`
  - `AMAP_WEB_SERVICE_KEY`
- These keys must not be exposed as frontend `VITE_` variables.
- WeChat Mini Program legal domains must include the CloudBase API gateway domain before true-device public preview:
  - `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com`
- CloudBase storage domains and any external media domains used by published content must be reviewed in the WeChat Mini Program console before public launch.

## Remaining Platform Dependencies

| Dependency | Owner | Status |
| --- | --- | --- |
| WeChat Mini Program legal request/download domains | Account owner | Blocker for public launch until configured and true-device verified. |
| WeChat account certification / share capability | Account owner | Blocker for final share acceptance if native share is unavailable on true devices. |
| CloudBase production identity replacement | Backend/account owner | Blocker for public launch; see `docs/production-acceptance-identity.md`. |
| Map permission and native navigation behavior | QA / account owner | Requires true-device evidence under OpenSpec GUI bundles. |
| Production media cleanup | Content operator | Published live content must not depend on mock fixture media. |

