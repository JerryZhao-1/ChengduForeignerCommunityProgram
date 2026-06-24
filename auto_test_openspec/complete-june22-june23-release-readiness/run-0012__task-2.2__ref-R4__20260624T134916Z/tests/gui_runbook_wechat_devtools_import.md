# GUI Runbook: WeChat DevTools Import

This run has already been executed on 2026-06-24.

## Verified results

- WeChat DevTools service port: `50375`, enabled.
- Login state: `{"login":true}` from DevTools CLI.
- Project open command succeeded:
  `/Applications/Coding/wechatwebdevtools.app/Contents/MacOS/cli open --project /Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin --port 50375`
- Preview command succeeded and generated `outputs/preview.png`.
- Home page launched without blank screen.
- Events page reachable: `pages/events/index`, text `活动列表和详情页已可独立联调`.
- Discover page reachable: `pages/discover/index`, text `内容流、发帖和详情壳已就位`.
- Places entry reachable: `pages/places/map`, text `社区地点地图`.
