# Browser MCP acceptance record

Browser: Codex in-app Browser, MCP-only. No repository browser automation script was created.

## Passed observations during the transient H5 deployment

- Canonical Welcome deep link loaded at `/?guest=judge#/pages/onboarding/welcome`.
- Chinese online flow: 36,608 ms; 390×844 viewport; online Plan showed no offline badge; Complete showed location `1/1` and Demo Confirm `1/1`.
- English online flow: 50,198 ms; 1280×900 viewport; online Plan showed no offline badge; Complete showed location `1/1` and Demo Confirm `1/1`.
- Stateless Plan deep link redirected to Welcome.
- Plan refresh redirected to Welcome.
- Console errors: zero on the main and deep-link tabs.
- Observed page assets: 16 total (8 scripts, 6 stylesheets, 1 image, 1 API resource). The only API resource was Community Plan generation; no model request was observed.
- API/local semantic comparator: exact equality for `v1:community-service:first-week:solo:none`, `tongzilin-curated-v1`, refs `place_001` and `event_001`, and four bilingual reason objects.
- Screenshot inspection: both saved 1280×900 English PNGs are blank and are not accepted as product screenshot evidence; the Chinese 390px captures are usable.

## Failed / unavailable requirement

The selected in-app Browser exposed only the `pageAssets` tab capability. Its raw CDP/request-interception capability returned `Capability is not available: cdp`. Therefore the run could not create a real browser flow that blocks only the Community Plan API. No offline badge, duration, or Complete result is claimed.

After Admin restoration, the public Web App domain no longer serves the H5. The transient online observations remain valid historical evidence of build behavior, but they do not establish a currently accepted release.
