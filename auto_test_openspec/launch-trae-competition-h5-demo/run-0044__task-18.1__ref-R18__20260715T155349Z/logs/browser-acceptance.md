# Browser acceptance

Browser operations used the in-app Browser MCP only. No repository browser
script was added.

## Preview

- Full Chinese judge path: 6.132 seconds.
- Plan had no offline badge.
- Complete showed location `1/1` and Demo Confirm `1/1`.
- Console error entries: 0.
- 390×844: viewport width 390, document width 390.
- 1280×900: viewport width 1280, document width 1280.
- Welcome deep link opened correctly.
- Stateless Plan deep link redirected to Welcome.
- Plan reload redirected to Welcome.

## Production Chinese online

- Elapsed: 29.741 seconds.
- Profile: `community-service / first-week / solo / none`.
- Plan had no offline badge.
- Complete showed location `1/1` and Demo Confirm `1/1`.
- Console error entries: 0.
- Viewport/document width: 390/390.

## Production English online

- Elapsed: 45.438 seconds.
- Profile: `community-service / first-week / solo / none`.
- Plan had no offline badge.
- Complete showed place visits `1/1` and Demo confirms `1/1`.
- Console error entries: 0.
- Viewport/document width: 1280/1280 at 1280×900.

## Production blocked-API offline

- **NOT RUN.**
- The in-app Browser MCP exposes visibility and viewport capabilities but no
  request interception capability.
- No interception-capable dedicated browser MCP is installed in this Session.
- A page mutation, API redeploy, OS-wide network outage, or new Playwright /
  Selenium script would not satisfy the authorized API-only MCP runbook, so none
  was substituted.

## Network and static resources

- The browser-observed entry and lazy assets were all same-origin Vercel assets.
- Root entry resources were individually fetched and returned HTTP 200; see
  `static-assets.tsv`.
- No model URL or credential appeared in the actual prebuilt scan.
- API/local semantic equality passed; see `semantic-fingerprint.json`.

## Screenshot limitation

The Browser MCP screenshot API returned blank frames in this Session even
though DOM, interaction, viewport, URL, and console evidence were available.
The blank files were deleted and are not claimed as product evidence.
