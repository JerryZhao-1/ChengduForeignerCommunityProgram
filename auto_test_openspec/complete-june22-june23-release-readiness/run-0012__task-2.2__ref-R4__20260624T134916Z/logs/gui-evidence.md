# WeChat DevTools Import And Main Flow Evidence

- Date: 2026-06-24
- Tool: WeChat DevTools Stable `2.01.2510280`
- Service port: `50375`
- Project path: `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`
- AppID: `wx7518a3c1fcdd39a5`
- CloudBase env id: `cloud1-d7gxdk8t43bd639c0`
- CloudBase function name: `community-map-api`

## CLI evidence

- `cli islogin --port 50375` returned `{"login":true}`.
- `cli open --project ... --port 50375` exited successfully.
- `cli preview --project ... --port 50375 --qr-format image --qr-output ... --info-output ...` exited successfully.
- Preview size: `363714` bytes.

## Simulator evidence

Computer Use inspected the running WeChat DevTools window:

- Window title: `ChengduForeignerCommunityProgram - 微信开发者工具 Stable v2.01.2510280`.
- Home launched without blank screen and displayed `桐梓林社区导览`, Events, Announcements, Places, and common entries.
- Events entry reached `pages/events/index` and displayed `活动列表和详情页已可独立联调`.
- Discover entry reached `pages/discover/index` and displayed `内容流、发帖和详情壳已就位`.
- Places entry reached `pages/places/map` and displayed `社区地点地图`.

## Notes

The DevTools debugger panel showed existing errors/warnings, including a map-page `URL is not a constructor` message, but the required import, launch, and main entry reachability checks completed. Real-device map/navigation/share remains task `2.3`.
