# Blocker: Real-Device Places Verification Not Available

- Date: 2026-06-24
- Severity: P0 for Mini Program release-readiness evidence
- Owner: release integrator with a physical WeChat-capable device and app id access
- Next repair window: before the 2026-06-24 all-module smoke start, or first available integration slot on 2026-06-25 if device access is delayed
- Mini Program import path: `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- App id: `wx7518a3c1fcdd39a5`
- Env id: `cloud1-d7gxdk8t43bd639c0`
- Function name: `community-map-api`

## Observed state

- The Mini Program package was built in `cloudbase-function` mode.
- No physical WeChat-capable device verification channel is available in this execution environment.
- Places list/map/detail, marker selection, native navigation, permission fallback, and share behavior were not verified on a real device.

## Required next action

Use a physical device with WeChat and app access, import or preview the generated package, and execute `tests/gui_runbook_real_device_places.md`. Record device type, tested place id, map/navigation/share results, permission prompts, screenshots, and any CloudBase invocation errors.
