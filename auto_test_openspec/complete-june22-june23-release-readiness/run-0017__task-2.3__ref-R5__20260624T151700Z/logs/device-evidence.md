# Real-Device Follow-Up Evidence

- Device: iPhone 14 Pro
- OS: iOS 26.5
- WeChat: 8.0.75
- Screenshot: `outputs/map-position-button-still-inert.jpg`
- User feedback: the red-arrow target `查看地图位置` still cannot be clicked.

## Root Cause

The page `pages/places/map` is registered as a tabBar page. Uni-app / WeChat Mini Program tabBar pages cannot be opened with `uni.navigateTo`; they must be opened with `uni.switchTab`.

## Fix Applied

- Detail page writes the selected place id to `PLACE_MAP_FOCUS_STORAGE_KEY`.
- Detail page opens the map tab with `uni.switchTab({ url: placesPagePaths.map() })`.
- Map page consumes the stored place id in `onShow` and focuses the matching marker after markers load.
- Rebuilt the Mini Program in `cloudbase-function` mode.
- Generated a new preview QR at `outputs/preview-switchtab.png`.

## Pending Retest

Scan `outputs/preview-switchtab.png` and verify:

1. Tapping `查看地图位置` opens the Places map tab.
2. The map selects or centers the `CloudBase Dev 验收点位` marker when marker data is available.
3. Native navigation from detail or map opens, or records a WeChat/iOS permission fallback.

