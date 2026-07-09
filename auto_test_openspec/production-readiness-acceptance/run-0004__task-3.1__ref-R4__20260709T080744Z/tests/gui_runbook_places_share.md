# GUI Runbook - Places Detail Share

Evidence owner: Supervisor / manual GUI runner

Target project:

- Mini Program project path: `apps/mobile/dist/build/mp-weixin`
- API mode: `cloudbase-function`
- API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

## Required Evidence

Save all screenshots and logs under:

`auto_test_openspec/production-readiness-acceptance/run-0004__task-3.1__ref-R4__20260709T080744Z/outputs/`

Required files:

- `places-share-detail-loaded.png`
- `places-share-native-panel.png` or `places-share-devtools-share-event.json`
- `places-share-console.log`
- `places-share-result.json`

## Steps

1. Open WeChat DevTools or a true Mini Program device preview using `apps/mobile/dist/build/mp-weixin`.
2. Open the Places tab and select a published place, or navigate directly to `/pages/places/detail?id=<published-place-id>`.
3. Confirm the detail page loads with title, cover or placeholder, address, and action buttons.
4. Tap the Places detail share button.
5. Confirm the action invokes native Mini Program share behavior:
   - On a true device, the WeChat share panel appears.
   - In DevTools, capture the share event / preview payload showing the current place title, path, and image when available.
6. Confirm the share button does not only copy `/pages/places/detail?id=<id>` while being labelled as native sharing.
7. If running a non-Mini Program fallback build, confirm the button is labelled as copy-link behavior rather than native sharing.

## Result JSON Template

Write `places-share-result.json`:

```json
{
  "surface": "wechat-devtools-or-true-device",
  "place_id": "<published-place-id>",
  "native_share_invoked": true,
  "share_payload": {
    "title": "<observed title>",
    "path": "/pages/places/detail?id=<published-place-id>",
    "imageUrl": "<observed image or null>"
  },
  "clipboard_only_behavior": false,
  "screenshots": [
    "places-share-detail-loaded.png",
    "places-share-native-panel.png"
  ],
  "console_log": "places-share-console.log",
  "notes": ""
}
```

