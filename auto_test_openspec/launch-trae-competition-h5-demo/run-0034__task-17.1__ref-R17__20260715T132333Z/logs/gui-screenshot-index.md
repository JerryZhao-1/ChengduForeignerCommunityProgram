# GUI screenshot index (R17 run-0034)

**Status: PENDING_SUPERVISOR_EXECUTION**

This file is a placeholder. The Supervisor will populate it after executing the MCP-only GUI runbook at `tests/gui_runbook_release_gate.md`.

## Required screenshots

### Release-gate-specific (per runbook)
| Screenshot | Locale | Status |
|------------|--------|--------|
| `outputs/zh-390px-no-horizontal-scroll.png` | zh | PENDING |
| `outputs/en-390px-no-horizontal-scroll.png` | en | PENDING |
| `outputs/zh-plan-no-raw-enum.png` | zh | PENDING |
| `outputs/en-plan-no-raw-enum.png` | en | PENDING |
| `outputs/zh-plan-no-ai-text.png` | zh | PENDING |
| `outputs/en-plan-no-ai-text.png` | en | PENDING |
| `outputs/zh-en-switch-plan-unchanged.png` | zh→en | PENDING |
| `outputs/zh-route-map-two-stops.png` | zh | PENDING |
| `outputs/en-route-map-two-stops.png` | en | PENDING |
| `outputs/zh-complete.png` | zh | PENDING |
| `outputs/en-complete.png` | en | PENDING |
| `outputs/zh-desktop-plan.png` | zh (1280×900) | PENDING |

### Profile matrix (4 profiles × 2 locales = 8 runs)
| Profile | Locale | Plan | Route-map | Complete |
|---------|--------|------|-----------|----------|
| community-service/first-week/solo/none | zh | PENDING | PENDING | PENDING |
| community-service/first-week/solo/none | en | PENDING | PENDING | PENDING |
| food-drink/first-month/family-with-kids/wheelchair | zh | PENDING | PENDING | PENDING |
| food-drink/first-month/family-with-kids/wheelchair | en | PENDING | PENDING | PENDING |
| social/settled/couple/low-vision | zh | PENDING | PENDING | PENDING |
| social/settled/couple/low-vision | en | PENDING | PENDING | PENDING |
| outdoor-sports/first-week/shared/quiet-environment | zh | PENDING | PENDING | PENDING |
| outdoor-sports/first-week/shared/quiet-environment | en | PENDING | PENDING | PENDING |

## Console error log

| Run | Console errors | Notes |
|-----|----------------|-------|
| All 8 runs | PENDING | To be recorded by Supervisor during MCP execution |

## Notes

- The Worker does not execute the GUI runbook and does not declare PASS/FAIL.
- All screenshots and console observations are to be captured by the Supervisor via MCP browser.
- After execution, update this file with actual paths and observations, then write the final verdict in `logs/supervisor-verdict.md`.
