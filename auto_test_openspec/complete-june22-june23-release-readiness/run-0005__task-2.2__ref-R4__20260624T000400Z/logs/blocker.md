# Blocker: WeChat DevTools Import Not Verified

- Date: 2026-06-24
- Severity: P0 for Mini Program release-readiness evidence
- Owner: release integrator with WeChat DevTools login and permission to change DevTools security settings
- Import path: `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- App id: `wx7518a3c1fcdd39a5`
- Env id: `cloud1-d7gxdk8t43bd639c0`
- Function name: `community-map-api`

## Observed state

- WeChat DevTools is installed at `/Applications/Coding/wechatwebdevtools.app`.
- The generated Mini Program package exists and includes `project.config.json` with app id `wx7518a3c1fcdd39a5`.
- The generated env bundle includes `cloudbaseEnvId: "cloud1-d7gxdk8t43bd639c0"` and `cloudFunctionName: "community-map-api"`.
- DevTools CLI check reported: IDE service port disabled. It prompted to enable CLI capability via DevTools security settings.
- The security setting was not changed in this run, so import, launch, and main-flow reachability were not verified.

## Required next action

Open WeChat DevTools, log in with the correct app permissions, enable the service port if CLI verification is desired, import the build path, and execute `tests/gui_runbook_wechat_devtools_import.md`.
