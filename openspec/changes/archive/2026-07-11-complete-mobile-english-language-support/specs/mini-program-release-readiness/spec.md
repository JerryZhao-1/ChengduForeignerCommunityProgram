## ADDED Requirements

### Requirement: Mini Program release evidence SHALL prove the complete English experience

The release process SHALL verify locale initialization, explicit switching, relaunch persistence, native navigation/tab updates, and complete English core journeys in the generated WeChat Mini Program, or record an explicit blocker.

#### Scenario: English Mini Program acceptance succeeds
- **WHEN** the generated package is exercised in WeChat DevTools and on a physical device with the active locale set to English
- **THEN** Home, Events browse/register/ticket, Discover browse/create/comment/report, Places list/map/detail/navigation/share, Me/Profile, notifications, registrations, login, and language settings are reachable with English system copy
- **AND** navigation titles and tab items use English
- **AND** relaunch preserves the explicit English choice
- **AND** evidence records build path, environment, device or DevTools identity, tested record ids, screenshots, and observed result

#### Scenario: Device-language initialization is verified
- **WHEN** the app launches without a stored or authenticated preference on a device configured for English
- **THEN** the initial locale resolves to English
- **AND** evidence records the clean-state preparation and observed first screen

#### Scenario: Complete English acceptance is blocked
- **WHEN** a route retains fixed Chinese system copy, a formal English field renders blank, preference resets, runtime title/tab update fails, or required device access is unavailable
- **THEN** the issue is recorded with severity, affected route/record, evidence, owner, and next action
- **AND** the complete-English release task remains incomplete

### Requirement: Production bilingual content audit SHALL use real candidate data

Release readiness SHALL include a reproducible audit of an exported production-candidate dataset and SHALL distinguish that evidence from fixture-only regression checks.

#### Scenario: Production candidate audit passes
- **WHEN** the audit receives an export with environment, timestamp, source query/collection provenance, record counts, and public candidate records
- **THEN** every public Place, Event, and Announcement passes its required bilingual-field, placeholder, status, URL, and media-attribution rules
- **AND** Discover UGC passes original-language metadata rules without requiring translated duplicates
- **AND** the output identifies the input as production-candidate rather than fixture

#### Scenario: Production candidate audit finds bilingual gaps
- **WHEN** a required English or Chinese field is missing, whitespace-only, a known placeholder, or would force fallback on launch-critical formal content
- **THEN** the audit emits a blocking issue with collection, record id, and field
- **AND** the release cannot claim complete English content readiness

#### Scenario: Only fixture audit is available
- **WHEN** the audit is run only against repository sample or mock data
- **THEN** the result may satisfy automated regression coverage
- **AND** it does not satisfy the production bilingual content release gate
