# GUI Runbook - Places Map And Navigation

Evidence owner: Supervisor / manual GUI runner

Target project:

- Mini Program project path: `apps/mobile/dist/build/mp-weixin`
- API mode: `cloudbase-function`
- API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

Save evidence under:

`auto_test_openspec/production-readiness-acceptance/run-0005__task-3.2__ref-R5__20260709T080951Z/outputs/`

## Required Files

- `places-map-loaded.png`
- `places-map-marker-selected.png`
- `places-detail-loaded.png`
- `places-detail-view-map-location.png`
- `places-navigation-launch.png` or `places-navigation-fallback.png`
- `places-navigation-console.log`
- `places-navigation-result.json`

## Steps

1. Open WeChat DevTools or a true Mini Program device preview using `apps/mobile/dist/build/mp-weixin`.
2. Open the Places map tab.
3. Confirm map markers load and the summary card shows a published place.
4. Tap a marker and confirm the selected summary card updates.
5. Tap `View place detail` and confirm it opens the selected place detail.
6. From detail, tap `View on map` and confirm the map focuses the same place.
7. From map summary or detail, tap the navigation action.
8. On a true device, record whether WeChat opens native location/navigation.
9. If permission is denied or platform launch fails, confirm a recoverable toast/fallback is shown and record the exact platform message.

## Result JSON Template

Write `places-navigation-result.json`:

```json
{
  "surface": "wechat-devtools-or-true-device",
  "place_id": "<published-place-id>",
  "map_markers_loaded": true,
  "marker_selection_worked": true,
  "detail_opened_from_map": true,
  "detail_view_map_focused_same_place": true,
  "native_navigation_invoked": true,
  "fallback_observed": false,
  "platform_message": null,
  "screenshots": [
    "places-map-loaded.png",
    "places-map-marker-selected.png",
    "places-detail-loaded.png",
    "places-detail-view-map-location.png",
    "places-navigation-launch.png"
  ],
  "console_log": "places-navigation-console.log",
  "notes": ""
}
```

