# GUI Evidence: R6

- change-id: add-map-marker-cover-preview
- run: run-0007
- task-id: 3.2
- ref-id: R6

## H5 Result

- Status: mobile-viewport screenshot and DOM evidence captured
- URL: `http://127.0.0.1:5174/#/pages/places/map?id=place_t381no`
- Seeded marker id: `place_t381no`
- Seeded marker name: `Cover Preview Test Place`
- Seeded cover URL: `http://127.0.0.1:5174/static/place-marker.svg`
- Screenshot artifact: `outputs/screenshots/r6-h5-marker-cover-preview.png`
- Screenshot note: recaptured with Playwright at a 390x844 mobile viewport. The screenshot shows the H5 map container, selected marker cover preview, selected summary card, detail CTA, navigation CTA, and bottom Places tab state.

Observed state from the MCP browser:

- map title visible: yes
- selected marker summary visible: yes
- selected cover preview visible inside the map: yes
- selected cover preview image visible: yes
- detail CTA visible: yes
- native navigation CTA visible: yes

The preview bounding box was within the map bounding box:

- viewport: `width=390 height=844`
- map: `left=12 top=172 right=378 bottom=546 width=365 height=374`
- preview: `left=218 top=248 right=320 bottom=320 width=102 height=73`
- preview image: `left=220 top=250 right=318 bottom=318 width=98 height=69`
- summary: `left=12 top=559 right=378 bottom=688 width=365 height=129`

## mp-weixin Result

- Status: blocked in this session
- Platform attempted: MCP-controlled WeChat Mini Program / WeChat DevTools target
- Exact blocker: tool discovery did not expose a callable MCP target for opening or screenshotting a WeChat Mini Program project. The available tools for this search were CloudBase docs/search, Context7 docs, Xcode simulator tools, and Codex thread tools, none of which can operate WeChat DevTools or capture mp-weixin UI state.
- H5 evidence passed: yes
- Follow-up owner: mobile QA / developer with an MCP-controlled WeChat DevTools target or manual WeChat DevTools access
