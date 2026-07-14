## MODIFIED Requirements

### Requirement: Mobile UI SHALL provide complete Chinese and English copy

The central mobile catalog SHALL provide recursively identical zh/en keys for every system-owned onboarding title, label, option, control, validation state, loading/empty state, status badge, error, route state, accessibility label, and completion result. Onboarding templates SHALL NOT contain raw user-facing strings, raw API/model messages, raw enum values, or locale ternaries.

#### Scenario: Judge completes onboarding in either locale

- **WHEN** the active locale is zh or en and the judge follows the canonical H5 path
- **THEN** every system-owned string is resolved from the active catalog
- **AND** both locales expose the same actions and state meanings

#### Scenario: Catalog parity is broken

- **WHEN** a key exists in only one locale
- **THEN** typechecking or catalog parity tests fail

## ADDED Requirements

### Requirement: Onboarding catalog SHALL cover the complete judge state machine

The onboarding namespace SHALL include localized copy for Start, preference fields/options/validation, Generate, plan item types and times, Open Route, route-list/map states, Open Place, Mark Visited, place unavailable, Demo Confirm, Demo-only disclosure, Finish Route disabled/enabled guidance, `1/1` completion results, Start Over, offline/fallback badge, AI source/status badges, refresh/deep-link recovery, and the Mini Program H5-only placeholder.

AI status copy SHALL cover `ok`, `not_configured`, `timeout`, `validation_failed`, `upstream_error`, and `unavailable`. It SHALL describe fallback without exposing model internals or suggesting that offline output is a live AI result.

#### Scenario: Every AI failure has localized safe copy

- **WHEN** a plan reports timeout, invalid output, upstream error, or unavailable AI
- **THEN** the active locale displays a catalog message explaining deterministic fallback
- **AND** no raw exception, provider response, prompt, or enum value is rendered

#### Scenario: Demo event cannot be mistaken for registration

- **WHEN** the event action and completion result render
- **THEN** both locales state that Demo Confirm creates no booking, reservation, ticket, or capacity hold

### Requirement: Stable API error codes SHALL map to catalog keys

The mobile adapter SHALL map stable API outcomes to catalog keys before UI rendering. At minimum, `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, and `RATE_LIMITED` SHALL map to localized onboarding errors; AI `timeout`, `validation_failed`, `upstream_error`, and `unavailable` SHALL map to localized status keys; transport/5xx offline selection SHALL map to the offline badge. Raw API `error.message`, SDK text, stack traces, and upstream bodies SHALL NOT be shown to users.

#### Scenario: HTTP 4xx uses mapped localized copy

- **WHEN** generation returns 400, 403, 404, 409, or 429
- **THEN** the client renders the catalog key associated with the stable error code
- **AND** it neither shows the raw server message nor activates offline mode

#### Scenario: Unknown error code uses localized generic fallback

- **WHEN** the client receives an unmapped error code
- **THEN** it displays a generic localized error with the request ID when available
- **AND** no untranslated or raw upstream text appears

### Requirement: Mini Program H5-only boundary SHALL be localized

The Mini Program deep-link placeholder SHALL have complete zh/en catalog entries and SHALL not reuse the H5 onboarding controls or imply functional support.

#### Scenario: Mini Program page is opened directly

- **WHEN** an onboarding route is loaded in the mp-weixin build
- **THEN** the active locale displays the H5-only explanation from the catalog
- **AND** no Generate, map, visit, or Demo Confirm action is exposed
