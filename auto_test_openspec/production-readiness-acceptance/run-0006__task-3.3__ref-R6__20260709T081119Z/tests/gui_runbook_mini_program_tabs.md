# GUI Runbook - Mini Program Tabs And Platform Capabilities

Evidence owner: Supervisor / manual GUI runner

Canonical DevTools import path:

`apps/mobile/dist/build/mp-weixin`

API target:

`https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

Save evidence under:

`auto_test_openspec/production-readiness-acceptance/run-0006__task-3.3__ref-R6__20260709T081119Z/outputs/`

## Required Files

- `tab-home.png`
- `tab-events.png`
- `tab-discover.png`
- `tab-places.png`
- `tab-me.png`
- `platform-network-domains.json`
- `platform-console.log`
- `platform-capabilities-result.json`

## Steps

1. Import `apps/mobile/dist/build/mp-weixin` in WeChat DevTools or open a true-device preview.
2. Confirm the imported project compiles without root-import path errors.
3. Open each tab: Home, Events, Discover, Places, Me.
4. For each tab, wait until loading completes or a classified recoverable error is shown.
5. Capture a screenshot for each tab.
6. Record console output and classify warnings:
   - favicon/deprecated warnings: non-business warning.
   - network/domain/map/media/auth errors: business or platform issue requiring classification.
7. Verify network calls use the CloudBase function target rather than `localhost`, `127.0.0.1`, or LAN IP.
8. In Places, verify map/media loading state is classified.
9. In a detail page that supports sharing/navigation, record share availability and permission fallback state if observed.

## Result JSON Template

Write `platform-capabilities-result.json`:

```json
{
  "surface": "wechat-devtools-or-true-device",
  "canonical_import_path": "apps/mobile/dist/build/mp-weixin",
  "tabs": {
    "Home": { "loaded": true, "screenshot": "tab-home.png" },
    "Events": { "loaded": true, "screenshot": "tab-events.png" },
    "Discover": { "loaded": true, "screenshot": "tab-discover.png" },
    "Places": { "loaded": true, "screenshot": "tab-places.png" },
    "Me": { "loaded": true, "screenshot": "tab-me.png" }
  },
  "network_target": "cloudbase-function",
  "localhost_or_lan_calls_seen": false,
  "map_loading_classification": "loaded-or-classified",
  "media_loading_classification": "loaded-or-classified",
  "share_state_classification": "available-or-classified",
  "permission_fallback_classification": "available-or-classified",
  "console_log": "platform-console.log",
  "notes": ""
}
```

