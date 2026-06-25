# Real-Device Places Runbook

- Change: `complete-june22-june23-release-readiness`
- Task: `2.3`
- Ref: `R5`
- Scope: GUI

## Prerequisite

Use the latest preview QR generated for this retest:

- `auto_test_openspec/complete-june22-june23-release-readiness/run-0018__task-2.3__ref-R5__20260625T000000Z/outputs/preview-refresh.png`

## Verification Steps

1. Open the preview on a physical WeChat-capable device.
2. Record device model, OS version, WeChat version, test date, and tested place id/name.
3. Verify app launch, Places list, Places map, and one Places detail page.
4. On the tested place detail page, tap `查看地图位置`.
5. Verify the Places map tab opens and displays or focuses `CloudBase Dev 验收点位`.
6. From the detail page or map summary, tap the native navigation action.
7. Record whether native navigation opens, or record the exact permission/platform fallback shown.
8. Trigger share and record either the share sheet result or the certification/platform limitation message.

## Required Evidence

Update `logs/device-evidence.md` or create a new append-only run folder with:

- device model, OS version, WeChat version, and test date
- tested place id/name
- map-position result
- native navigation result or permission fallback
- share result or platform limitation
- screenshots or equivalent device/DevTools records when available

