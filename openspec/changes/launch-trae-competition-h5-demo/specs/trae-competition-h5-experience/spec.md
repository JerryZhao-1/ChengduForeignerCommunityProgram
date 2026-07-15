## ADDED Requirements

### Requirement: H5 SHALL expose a guest judge entry without granting write permissions

The canonical H5 entry SHALL be `/?guest=judge#/pages/onboarding/welcome`. The client SHALL send `x-guest-mode: judge` without bearer or mock-user headers. Guest SHALL be allowed public reads and only `POST /community-plan/generate`; every other guest mutation SHALL return `403 FORBIDDEN` without provider mutation.

#### Scenario: Judge starts without login

- **WHEN** the canonical URL opens without a token
- **THEN** welcome renders without authentication
- **AND** generation identifies the request as guest

### Requirement: H5 SHALL collect only required singular preferences

`pages/onboarding/preferences` SHALL collect the five strict shared fields. Interest and accessibility controls SHALL be single-choice. The client SHALL send no `community_id`, array, identity/contact data, or free text.

#### Scenario: Valid singular preferences generate a plan

- **WHEN** all five fields are selected and Generate is chosen
- **THEN** only allowlisted singular fields are sent
- **AND** the validated plan initializes the memory-only session

#### Scenario: Incomplete preferences stay on the page

- **WHEN** a required selection is absent
- **THEN** Generate is unavailable or a localized validation state is shown
- **AND** no request is sent

### Requirement: H5 SHALL render an explainable curated plan

`pages/onboarding/plan` SHALL render the ordered two-item plan, bilingual selection summary, and exactly four reasons in shared-schema order. It SHALL describe the result as a community curated match and SHALL not render generation source, model status, raw enums, or model claims.

#### Scenario: Every selected dimension is explained

- **WHEN** a validated plan opens
- **THEN** the “为什么这样匹配” section displays four localized reasons
- **AND** each reason corresponds to one selected dimension

### Requirement: H5 SHALL use a memory-only deterministic state machine

The canonical transition sequence SHALL remain:

`welcome --Start--> preferences --Generate--> plan --Open Route--> route-list --Back--> plan --Open Place--> place-detail --Mark Visited--> plan --Demo Confirm--> plan --Finish Route--> complete`.

Refresh/deep link without valid state SHALL redirect to welcome. Start Over SHALL clear preferences, plan, local statuses, delivery mode, and errors.

#### Scenario: Completion is gated

- **WHEN** either required local action remains pending
- **THEN** Finish Route stays disabled

#### Scenario: Start Over clears all session state

- **WHEN** Start Over is chosen
- **THEN** the app returns to welcome with a fresh singular-preference draft

### Requirement: Place and event actions SHALL remain explicit and local

The place action SHALL open the existing place detail and support Mark Visited. A detail 404 SHALL mark the local item unavailable and remove it from the denominator. Demo Confirm SHALL update only memory state and clearly state that it creates no booking, reservation, ticket, or capacity hold.

#### Scenario: Event confirmation creates no registration

- **WHEN** Demo Confirm is selected
- **THEN** the event becomes `demo_confirmed` locally
- **AND** no registration, availability, ticket, or capacity API is called

### Requirement: H5 SHALL always provide a marker-safe route list

`pages/onboarding/route-map` SHALL always render the ordered place route using only safe projection fields. H5 MAY add map markers when its SDK/key works, but no key, invalid key, blocked SDK, or load error SHALL prevent route-list use. H5 SDK code SHALL remain compile-guarded from mp-weixin.

#### Scenario: Route list works without map SDK

- **WHEN** map configuration is absent or fails
- **THEN** the complete ordered route list remains actionable

### Requirement: H5 SHALL use the shared catalog for offline delivery

Mock mode and HTTP transport/DNS/timeout/5xx SHALL invoke the shared matcher locally with the current singular preference. HTTP 400/403/404/409/429 SHALL remain errors. Online and local results SHALL match scenario key, catalog version, item refs, explanation, summaries, and tips for all 576 profiles. Offline delivery SHALL show its localized badge.

#### Scenario: Network failure preserves personalization

- **WHEN** API transport fails after a complete profile is selected
- **THEN** local matching produces the same semantic result
- **AND** the offline badge is visible

### Requirement: H5 SHALL complete with one visit and one demo confirmation

Finish Route SHALL be reachable only after all available places are visited and the event is demo-confirmed. The canonical fixture SHALL show `1/1` for both outcomes. The complete path SHALL remain executable within 180 seconds.

#### Scenario: Canonical session completes deterministically

- **WHEN** the place is visited and event demo-confirmed
- **THEN** completion shows `1/1` for both outcomes
- **AND** contains no real-registration claim

### Requirement: H5 and Mini Program boundaries SHALL remain explicit

Onboarding pages SHALL remain outside tabBar and functional acceptance SHALL be H5-only. The Mini Program SHALL expose no onboarding entry and direct links SHALL show only the localized H5-only placeholder. H5 and mp-weixin production builds SHALL pass.

#### Scenario: Both targets compile without boundary leakage

- **WHEN** production builds run
- **THEN** both exit successfully
- **AND** H5 DOM/map behavior does not leak into the Mini Program bundle

### Requirement: H5 SHALL preserve the approved responsive and accessible design

The flow SHALL reuse approved field-guide tokens and no additional UI library. Layout SHALL be mobile-first at 390px and centered at maximum width 480px on desktop. Interactive targets SHALL be at least 44px with localized accessible names, visible focus, and readable contrast.

#### Scenario: Mobile and desktop use the same flow

- **WHEN** pages render at 390px and 1280px
- **THEN** the same single-column state machine remains usable
