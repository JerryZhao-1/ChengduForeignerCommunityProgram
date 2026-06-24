# Validation Bundle: Task 2.2 / R4

- change-id: `complete-june22-june23-release-readiness`
- run: `0012`
- task-id: `2.2`
- ref-id: `R4`
- scope: `GUI`

## How to run

macOS/Linux:

```bash
auto_test_openspec/complete-june22-june23-release-readiness/run-0012__task-2.2__ref-R4__20260624T134916Z/run.sh
```

Windows:

```bat
auto_test_openspec\complete-june22-june23-release-readiness\run-0012__task-2.2__ref-R4__20260624T134916Z\run.bat
```

## Expected results

- WeChat DevTools opens the generated Mini Program project at `/Users/jerry/A/communityMap/ChengduForeignerCommunityProgram/apps/mobile/dist/build/mp-weixin`.
- DevTools uses AppID `wx7518a3c1fcdd39a5`.
- Preview generation succeeds.
- The simulator launches without a blank screen.
- Home, Events, Discover, and Places entry pages are reachable.

## GUI evidence

See `logs/gui-evidence.md`.

## Outputs

- `outputs/import-context.txt`
- `outputs/preview-info.json`
- `outputs/preview.png`
- `logs/gui-evidence.md`

## Provenance

Observed through WeChat DevTools Stable `2.01.2510280` with service port `50375` enabled on 2026-06-24. Project open and preview were performed through the DevTools CLI; page reachability was verified through the local app accessibility tree.
