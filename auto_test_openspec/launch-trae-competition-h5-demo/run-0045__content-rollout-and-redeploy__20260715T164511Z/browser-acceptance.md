# Browser acceptance

In-app Browser MCP was used; no browser automation script was added.

- 390px anonymous Events rendered four public events, including all three curated events, with zero console errors.
- Source/focused tests prove guests skip private registrations. Browser MCP exposed no request ledger, so no fabricated live network log is claimed.
- Discover rendered all ten curated posts and five authors; junk titles `111` and `22` were absent; zero console errors.
- Searching Places for `桐邻` returned all four curated places. Detail deep link resolved `demo_place_newcomer_hub` and two related posts.
- H5 map retained the expected `地图暂不可用` notice and list/detail continuation.
- English selection rendered the English activity list and all three bilingual curated events.
- Production deep-link refresh and 1280×900 Discover both passed with zero console errors.
- Authenticated registration behavior passed focused tests but was not live-tested without a legitimate test credential.
- Admin `/`, `/events`, `/places`, `/posts` returned the same new SPA entry. Browser passed the CloudBase interstitial and reached `Community Map Admin` login with `redirect=/events`; logged-in UI is not falsely claimed.

See `screenshots/index.md`.
