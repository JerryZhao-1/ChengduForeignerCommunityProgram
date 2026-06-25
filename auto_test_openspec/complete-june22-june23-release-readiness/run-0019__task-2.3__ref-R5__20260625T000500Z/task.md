# Task 2.3 Real-Device Places Map-Position Evidence

- Change: `complete-june22-june23-release-readiness`
- Task: `2.3 Verify real-device places map navigation and share or record a blocker`
- Ref: `R5`
- Date: 2026-06-25
- Scope: GUI

## Purpose

Record the physical-device map-position verification after the switchTab fix and define the remaining GUI check needed for native navigation.

## How to run

- macOS/Linux: `./run.sh`
- Windows: `run.bat`

The script prints the GUI runbook path. Physical-device verification is performed from `tests/gui_runbook_real_device_places.md`.

## Result

Task `2.3` remains pending. The physical device verified that `查看地图位置` opens the Places map page and the map displays `CloudBase Dev 验收点位`. Share remains documented as an accepted WeChat platform limitation because the Mini Program is not certified. Native navigation or an acceptable permission fallback still needs physical-device evidence.
