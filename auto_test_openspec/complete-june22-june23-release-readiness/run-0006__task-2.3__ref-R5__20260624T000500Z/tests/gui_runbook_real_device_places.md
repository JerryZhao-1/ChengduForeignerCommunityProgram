# GUI Runbook: Real-Device Places Verification

Use MCP-approved device or GUI evidence collection only. Do not run browser automation scripts.

## Context

- Mini Program import path: `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- App id: `wx7518a3c1fcdd39a5`
- CloudBase env id: `cloud1-d7gxdk8t43bd639c0`
- CloudBase function name: `community-map-api`
- API mode: `cloudbase-function`

## Required evidence

1. Device type and OS/WeChat version.
2. Test date and operator.
3. Tested place id.
4. Places list reachable.
5. Places map reachable.
6. Marker selection opens the expected place summary/detail path.
7. Detail page navigation action either opens native navigation or shows an acceptable permission fallback.
8. Place share action completes or records the platform fallback.
9. Permission prompts and CloudBase invocation errors, if any.

Store screenshots or structured notes under this run folder in `outputs/screenshots/` or `logs/`.

## Current blocker

This run did not execute the real-device flow because no physical WeChat-capable device evidence channel is available in the current execution environment.
