# MCP-only external acceptance runbook

Use the in-app Browser MCP. Do not add Playwright, Selenium, or another browser script to the repository. Save captures under `outputs/screenshots/` and append only observed facts to the logs.

## Shared profile

Use `community-service / first-week / solo / none` for all three flows. Each flow starts at Welcome and ends at Complete with location progress `1/1` and Demo Confirm `1/1`. Record elapsed wall time; each must be at most 180 seconds.

## Flows

1. Chinese online: API request succeeds; no offline badge.
2. English online: API request succeeds; no offline badge.
3. Blocked API offline: block only the Community Plan generation endpoint; the plan completes from the local matcher and displays the same-version catalog offline badge.

## Required checks

- Compare `scenario_key`, `catalog_version`, both refs, and all four explanation lines between the online API result and local matcher; require exact equality.
- Verify a 390px mobile viewport and a 1280x900 desktop viewport.
- Verify Welcome deep link, a stateless Plan deep link, and Plan refresh redirect behavior.
- Verify static resources load, browser console has zero errors, and network contains no model request, credential, or secret.
- Re-check Admin Static Hosting after deployment and require status, ETag, body SHA-256, and entry resource list to equal the pre-deployment fingerprint.

## Recommended captures

- Chinese online Complete view and its network request.
- English online Complete view and its network request.
- Offline Plan/Complete view with same-version catalog badge and blocked request.
- 390px Welcome and 1280x900 Plan/Complete views.
- Deep-link/refresh result, console, network, and Admin before/after fingerprints.
