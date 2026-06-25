# Real-Device Map-Position Evidence

- Device: iPhone 14 Pro
- OS: iOS 26.5
- WeChat: 8.0.75
- Test date: 2026-06-25 Asia/Shanghai
- App launch: passed
- Places list: passed
- Places map: passed
- Detail page: passed
- Map-position action: passed; tapping `查看地图位置` opens the Places map page.
- Tested place: `CloudBase Dev 验收点位`
- Map target result: passed; map page displays `CloudBase Dev 验收点位`.
- Share result: accepted platform limitation; WeChat reports the Mini Program is not certified and temporarily cannot use the share panel.
- Native navigation/fallback: pending; no physical-device evidence has been recorded yet for opening native navigation or showing an acceptable permission fallback.

## Conclusion

The map-position regression is fixed on a physical device. Task `2.3` remains pending until native navigation or an acceptable permission fallback is recorded. Certification-dependent sharing must be retested when Mini Program certification status changes, but it does not block this OpenSpec task by itself.
