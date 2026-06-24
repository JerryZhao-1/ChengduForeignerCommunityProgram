# Real-Device Evidence

- Device: iPhone 14 Pro
- OS: iOS 26.5
- WeChat: 8.0.75
- Test date/time: 2026-06-24 21:58 Asia/Shanghai
- App launch: passed, no blank screen
- Places list: reachable
- Places map: reachable
- Observed blocker: map page displays `Can't find variable: URL`
- Screenshot: `outputs/iphone-14-pro-map-url-error.png`

## Interpretation

The error is caused by the Mini Program runtime not providing a browser-compatible global `URL` constructor. The mobile CloudBase function requester previously used `new URL(url, "http://localhost")` while resolving request paths.

## Fix Applied

- `apps/mobile/src/api/client.ts` now uses `resolveCloudbaseFunctionPath(url)`.
- `apps/mobile/src/api/cloudbase-path.ts` implements URL-to-path extraction with string operations only.
- `apps/mobile/src/api/client.spec.ts` covers absolute URLs, query preservation, and relative path normalization.
- A new `cloudbase-function` Mini Program build completed successfully.
- A new preview QR was generated at `outputs/preview-urlfix.png`.

## Pending Retest

Retest with `outputs/preview-urlfix.png` and record:

1. Map page no longer shows `Can't find variable: URL`.
2. Markers render or an API/data blocker is recorded.
3. Marker selection opens the expected summary/detail path.
4. Detail navigation opens native navigation or shows an acceptable permission fallback.
5. Share action opens the WeChat share sheet or records a platform limitation.

