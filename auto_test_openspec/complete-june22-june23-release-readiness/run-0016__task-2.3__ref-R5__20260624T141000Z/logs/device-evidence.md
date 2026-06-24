# Real-Device Retest Evidence

- Device: iPhone 14 Pro
- OS: iOS 26.5
- WeChat: 8.0.75
- Test date: 2026-06-24
- Result from tester: "分享不能拉起微信分享面板。提示小程序未认证，暂时无法使用。然后查看地图位置按钮无法点击。其他都可以使用"

## Interpretation

- App launch: passed from previous evidence.
- Places list: passed from previous evidence.
- Places map: passed from previous evidence.
- Map URL runtime error: fixed by run `0015`; tester reports other flows are usable.
- Share: accepted platform limitation for current preview/trial status. WeChat reports the Mini Program is not certified, so share panel cannot be used yet.
- Map position button: product bug. The detail page button was disabled when coordinates were considered unavailable, so the user could not tap it and get feedback.

## Fix Applied

- Removed the disabled state from the detail page `查看地图位置` button.
- `openMapPosition` still validates coordinates and shows the existing unavailable toast when needed.
- Rebuilt the Mini Program in `cloudbase-function` mode.
- Generated a new preview QR at `outputs/preview-mapbutton.png`.

## Pending Retest

Scan `outputs/preview-mapbutton.png` and verify:

1. The detail page `查看地图位置` button can be tapped.
2. If the selected place has coordinates, it navigates to the map page with that place id.
3. If the selected place lacks usable coordinates, it shows an unavailable toast instead of being inert.
4. Native navigation from detail or map opens, or records a WeChat/iOS permission fallback.

