# GUI screenshot index

- Execution: `2026-07-15T12:07:25Z`
- Service: forced mock mode via `run.sh` (`VITE_API_MODE=mock`)
- URL: `http://127.0.0.1:5174/?guest=judge#/pages/onboarding/welcome`

## English mobile

- Viewport: `390 × 844`
- `outputs/en-mobile-focus-visible.png` (`390 × 844`): Food & Drink was activated with Space after Community Service was activated with Enter. The observed `aria-checked` state changed from Community Service `true` to `false` and Food & Drink `false` to `true`; the focused selection has a visible gold outline.
- `outputs/en-mobile-local-plan-viewport.png` (`390 × 844`): viewport capture of the generated English plan.
- `outputs/en-mobile-local-plan.png` (`390 × 2016`): full-page capture produced from the `390 × 844` viewport. It records the localized offline badge, curated summary, and the four reason labels in order: Primary interest, Arrival stage, Household, Participation guidance.
- Accessibility choice check: No additional need was activated with Enter, then Quiet environment with Space. Final `aria-checked` values were `false` and `true`, respectively.

## Chinese desktop

- Viewport: `1280 × 900`
- Profile: built-in example profile (`community-service`, `first-week`, `solo`, `none`).
- `outputs/zh-desktop-local-plan.png` (`1280 × 900`): localized offline badge, Chinese summary, and all four Chinese reason labels are visible.

## Additional observations

- Plan controls measured exactly `44px` high or greater; no visible plan control was below `44 × 44`.
- The rendered English and Chinese plan snapshots contained no `generated_by`, `provider status`, or `model status` copy.
- The raw TRAE S09 session screenshot is stored separately at `evidence/trae-sessions/S09/trae-session-overview.png`.
