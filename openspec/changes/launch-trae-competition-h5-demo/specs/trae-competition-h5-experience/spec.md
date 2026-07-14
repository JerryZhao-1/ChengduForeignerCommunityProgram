## ADDED Requirements

### Requirement: H5 SHALL expose a guest judge entry without granting user write permissions

The canonical H5 entry SHALL be `/?guest=judge#/pages/onboarding/welcome`. The client SHALL send `x-guest-mode: judge` without bearer or mock-user headers, and CORS SHALL allow that header. The API SHALL resolve an API-internal guest request actor with `authenticatedVia: "guest"`; guest SHALL NOT be added to shared role flags or treated as a normal user.

The guest SHALL be allowed to read existing public resources and call only `POST /community-plan/generate`. Every other guest mutation SHALL return the standard `403 FORBIDDEN` envelope, regardless of whether the client exposes the action.

#### Scenario: Judge starts without login

- **WHEN** a judge opens the canonical URL with no token
- **THEN** the welcome page renders without an auth step
- **AND** public reads and plan generation identify the request as guest

#### Scenario: Guest header passes CORS preflight

- **WHEN** the browser preflights a request containing `x-guest-mode`
- **THEN** CORS allows the header and the preflight succeeds

#### Scenario: Guest writes are denied across modules

- **WHEN** a guest calls representative write endpoints in events, discover, files, places, auth/preferences, notifications, or admin
- **THEN** every request returns `403 FORBIDDEN`
- **AND** no provider mutation occurs

### Requirement: H5 SHALL provide a strict preference and generation step

`pages/onboarding/preferences` SHALL collect only the fields in the strict shared preference schema, validate them before submission, and call the shared generation client. It SHALL NOT send `community_id`, identity/contact data, or free text. All controls and validation messages SHALL use the central catalog.

#### Scenario: Valid preferences generate a plan

- **WHEN** the judge completes all required enum/multi-select controls and chooses Generate
- **THEN** the client sends only the allowlisted preference fields to `POST /community-plan/generate`
- **AND** the returned plan initializes the memory-only session before navigation to the plan page

#### Scenario: Invalid preferences stay on the page

- **WHEN** required selections are absent or an input is outside the shared enum
- **THEN** a localized inline error is shown
- **AND** no request is sent

### Requirement: H5 SHALL use a memory-only planner session with deterministic transitions

The onboarding flow SHALL use the existing reactive-store pattern or an equivalent session store without adding a persistence requirement. It SHALL keep the plan and local item statuses in memory only. Missing state after refresh or deep link SHALL redirect to welcome. Start Over SHALL clear all session state.

The canonical transition sequence SHALL be:

`welcome --Start--> preferences --Generate--> plan --Open Route--> route-list --Back--> plan --Open Place--> place-detail --Mark Visited--> plan --Demo Confirm--> plan --Finish Route--> complete`.

#### Scenario: Canonical judge path has explicit start and finish

- **WHEN** the judge chooses Start and follows the canonical transitions
- **THEN** every action has an explicit CTA and resulting state
- **AND** Finish Route reaches the completion page only after both required actions

#### Scenario: Refresh without session is safe

- **WHEN** the judge refreshes or deep-links to plan, route, or completion without a valid memory session
- **THEN** the app redirects to welcome without rendering stale or partial data

#### Scenario: Start Over clears state

- **WHEN** Start Over is chosen on completion
- **THEN** plan, preferences, statuses, source badges, and offline state are cleared
- **AND** the app returns to welcome

### Requirement: H5 SHALL render an ordered two-item plan and explicit local actions

`pages/onboarding/plan` SHALL render the validated place and curated-event items in chronological order with bilingual title, summary, tips, start offset, duration, type, state, and localized generation/AI status. The place CTA SHALL open the existing place detail route and provide an explicit Mark Visited action on successful return/interaction. A place detail `404` SHALL mark the local item unavailable and remove it from the completion denominator.

The event CTA SHALL perform Demo Confirm locally from the plan/event safe snapshot. It SHALL clearly state in both languages that no booking, reservation, ticket, or capacity hold is created. It SHALL NOT call an event registration or availability endpoint and SHALL NOT claim real-time capacity.

#### Scenario: Place visit becomes explicit session state

- **WHEN** the judge opens the referenced published place and chooses Mark Visited
- **THEN** the session changes that item to `visited`
- **AND** the plan page visibly reflects the completed action

#### Scenario: Missing place becomes unavailable

- **WHEN** place detail returns `404`
- **THEN** the item becomes `unavailable` with localized guidance
- **AND** it is excluded from the completion denominator

#### Scenario: Event confirmation is demonstrably non-persistent

- **WHEN** the judge chooses Demo Confirm
- **THEN** the event item becomes `demo_confirmed` in memory
- **AND** no registration, ticket, availability, or capacity API is called
- **AND** the UI states that the action is Demo only

### Requirement: H5 SHALL always provide a marker-safe route list and MAY enhance it with a map

`pages/onboarding/route-map` SHALL always render the place portion of the plan as an ordered route list using only `_id`, `name_zh`, `name_en`, `cover_url`, `category_level_1`, `is_recommended`, and `location`. The list SHALL remain complete and actionable without a map key or SDK.

H5 MAY load the Tencent Map JavaScript SDK only when `VITE_H5_MAP_KEY` and the required allowed domain are ready. H5 DOM/SDK code SHALL be compile-guarded and SHALL NOT reuse the WeChat `<map>` component. SDK absence, load error, invalid key, or blocked network SHALL leave the route list usable and show a localized map-unavailable state. Route rendering SHALL NOT fetch place details merely to build summaries.

#### Scenario: Route list works without SDK configuration

- **WHEN** no H5 map key is configured
- **THEN** the ordered marker-safe route list renders successfully
- **AND** the judge can return to the plan and continue the flow

#### Scenario: Optional SDK enhances the route

- **WHEN** the key, allowed domain, and SDK are available
- **THEN** H5 renders markers/route order in addition to the baseline list
- **AND** the list remains the source of accessible route content

#### Scenario: Detail or admin fields cannot appear in route summary

- **WHEN** upstream source data contains address, intro, gallery, navigation, moderation, import-review, or audit fields
- **THEN** none of those fields is serialized or rendered by the route list/map adapter

### Requirement: H5 SHALL gate completion on one visit and one demo confirmation

`pages/onboarding/complete` SHALL be reachable through Finish Route only when every currently available place item is `visited` and the curated event is `demo_confirmed`. Unavailable places SHALL be removed from both the numerator and denominator; if the only place becomes unavailable, completion MAY proceed after the event confirmation with an explicit `0/0 unavailable-place` warning. Before the applicable predicate is met, Finish Route SHALL be disabled with localized guidance. Completion SHALL show an explicit `1/1` visited-place result and `1/1` demo-event result for the canonical online and offline fixtures, plus Start Over. The full canonical path SHALL be executable in at most 180 seconds.

#### Scenario: Incomplete session cannot finish

- **WHEN** either required item remains pending
- **THEN** Finish Route is disabled and completion is not navigated to

#### Scenario: Completed canonical session has deterministic result

- **WHEN** the place is visited and the event is demo-confirmed
- **THEN** Finish Route opens completion with `1/1` for both outcomes
- **AND** the result contains no claim of a real registration or ticket

#### Scenario: Judge path meets the time budget

- **WHEN** a reviewer follows the seeded canonical path from Start through completion
- **THEN** it completes within 180 seconds without admin setup or login

### Requirement: H5 SHALL use a strict offline Demo adapter independent from the formal API

Mock mode SHALL load the bundled, schema-validated offline bundle with no network calls. HTTP transport/DNS/timeout failures and HTTP 5xx MAY activate the offline adapter. HTTP 400, 403, 404, 409, and 429 SHALL remain API errors and SHALL NOT activate offline mode. Offline output SHALL show a localized offline/fallback badge and SHALL never present itself as live AI success.

The offline bundle SHALL contain exactly the canonical two-item plan, marker-safe place data, and public-safe place/event snapshots needed for the read-only flow. Local Mark Visited and Demo Confirm SHALL work without the formal API.

#### Scenario: Offline mode requires no API capability

- **WHEN** H5 runs in mock mode with network requests blocked
- **THEN** the full canonical route through `1/1` completion remains usable from the bundle
- **AND** an offline badge is visible

#### Scenario: Server error selects offline fallback

- **WHEN** HTTP mode encounters a transport failure, timeout, DNS failure, or 5xx response
- **THEN** the offline bundle is loaded and visibly labelled

#### Scenario: Client error remains localized API error

- **WHEN** HTTP mode receives 400, 403, 404, 409, or 429
- **THEN** the corresponding localized error is shown
- **AND** the offline bundle is not loaded

### Requirement: H5 and Mini Program boundaries SHALL be explicit

The five onboarding pages SHALL be registered outside the tab bar. The public onboarding entry and functional acceptance SHALL be H5-only. H5-only DOM/map code SHALL use compile guards. The Mini Program SHALL not expose an onboarding navigation entry; a direct/deep link SHALL render a localized “H5 Demo only” placeholder. Both `build:h5` and `build:mp-weixin` SHALL pass.

#### Scenario: H5 exposes the judge flow

- **WHEN** the H5 canonical URL is opened
- **THEN** Start is available and the complete judge path can run

#### Scenario: Mini Program does not claim onboarding support

- **WHEN** the Mini Program navigation and a direct onboarding page are inspected
- **THEN** no onboarding entry is exposed
- **AND** a direct page load shows only the localized H5-only placeholder

#### Scenario: Both targets compile

- **WHEN** the H5 and mp-weixin production builds run
- **THEN** both exit successfully without H5 DOM leaking into the Mini Program bundle

### Requirement: H5 SHALL preserve the approved responsive and accessible design boundary

All onboarding pages SHALL use the approved editorial community-field-guide tokens, central mobile catalog, and no additional UI library. The primary layout SHALL be mobile-first at 390px and centered at a maximum width of 480px from 768px upward. Interactive targets SHALL be at least 44px, text contrast at least 4.5:1, and H5 form/actions keyboard operable with semantic labels and visible focus.

#### Scenario: Mobile and desktop remain one flow

- **WHEN** the pages render at 390px and 1280px
- **THEN** the same single-column state machine is usable
- **AND** desktop content is centered and does not expand into a new two-column scope

#### Scenario: Core actions are accessible

- **WHEN** Start, Generate, Open Route, Mark Visited, Demo Confirm, Finish Route, and Start Over are inspected
- **THEN** each has a localized accessible name, visible focus, and at least a 44px target
