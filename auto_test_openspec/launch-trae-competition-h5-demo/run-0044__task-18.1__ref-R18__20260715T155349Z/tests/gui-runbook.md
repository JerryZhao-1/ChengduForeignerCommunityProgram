# MCP-only Vercel public acceptance runbook

Use the in-app Browser MCP for online flows. Do not add Playwright or Selenium
scripts. Use an interception-capable dedicated browser MCP, if installed, only
for the API-only offline flow.

## Shared logical profile

`community-service / first-week / solo / none`

## Preview

1. Open the Vercel Preview through its temporary authenticated share URL.
2. Complete Welcome → Plan → Complete within 180 seconds.
3. Require no offline badge, location `1/1`, Demo Confirm `1/1`, and zero
   console errors.
4. Verify 390px and 1280×900 layouts, Welcome deep link, stateless Plan deep
   link, and Plan refresh redirect.

## Production

1. Chinese online: require API success, no offline badge, and Complete `1/1`
   plus `1/1`.
2. English online: select English plus the same logical profile; require the
   same completion and no offline badge.
3. Offline: block only
   `/api/community-plan/generate`; require the local matcher, same-version
   catalog offline badge, Complete `1/1` plus `1/1`, and no other network
   block.
4. Each full flow must finish within 180 seconds.
5. Compare `scenario_key`, `catalog_version`, both refs, and four bilingual
   explanation modules against the shared local matcher.
6. Require static assets 200, console zero errors, and no model request,
   credential, or secret in the network.
7. Recapture Admin root and `/places`; compare HTTP status, ETag, body SHA-256,
   and entry assets with the pre-deployment fingerprint.

## Required captures still to save

- Raw S14 TRAE session screenshot with the full Session ID visible.
- Production Chinese online Plan and Complete at 390px.
- Production English online Plan and Complete at 1280×900.
- Offline Plan and Complete with the same-version catalog badge plus the single
  blocked API request.
- Console, network, deep-link/refresh, and Admin before/after comparisons.
