## ADDED Requirements

### Requirement: Published Events SHALL contain complete bilingual formal content

The system SHALL allow incomplete Events to remain draft but SHALL reject approval/publication and edits to already published Events when required Chinese or English launch fields are empty, whitespace-only, or known placeholders.

#### Scenario: Admin publishes a bilingual-complete Event
- **WHEN** an authorized admin approves and publishes an Event with non-placeholder `title_zh`, `title_en`, `summary_zh`, `summary_en`, `content_zh`, `content_en`, `address_zh`, and `address_en`
- **THEN** publication succeeds
- **AND** public reads expose the complete bilingual formal content through shared contracts

#### Scenario: Admin saves an incomplete Event draft
- **WHEN** an authorized admin saves an Event with one or more incomplete bilingual fields and keeps it in a non-public draft state
- **THEN** the draft save succeeds
- **AND** the admin UI identifies the fields required before publication

#### Scenario: Admin publishes or edits a public Event with missing English content
- **WHEN** an Event would be publicly visible after a create, review, status transition, or update and a required English field is missing or a known placeholder
- **THEN** the API rejects the mutation with a validation error containing field-level details
- **AND** the previous Event state remains unchanged

### Requirement: Mobile Events flow SHALL be complete in the active locale

The mobile Events list, detail, registration, registration-status, ticket, related-discussion, loading, empty, error, validation, and success flows SHALL render all system-owned copy in the active locale.

#### Scenario: English user browses and registers for an Event
- **WHEN** the active locale is `en` and an eligible user opens an Event, completes registration, and views the ticket
- **THEN** the Event title, summary, content, address, state labels, field labels, validation, actions, confirmation, and ticket labels are English
- **AND** the underlying registration and ownership rules remain unchanged

#### Scenario: Registration is unavailable in English
- **WHEN** the active locale is `en` and an Event is full, closed, ended, unavailable, or already registered
- **THEN** the status label and explanatory reason are English
- **AND** the same domain-state code produces equivalent Chinese copy under `zh`

## MODIFIED Requirements

### Requirement: Events backoffice UI SHALL support basic admin event management
The admin Events page SHALL provide a usable management interface for event listing, filtering, bilingual-content readiness, creation, editing, publication state changes, and user feedback.

#### Scenario: Admin views and filters all event states
- **WHEN** an admin opens the Events management page
- **THEN** the page loads events from the admin list API
- **AND** draft and non-public events are visible to the admin
- **AND** filters allow narrowing by review status, publish status, keyword, drafts, and published events
- **AND** the table displays event time, signup deadline, capacity, current registration count, full-capacity state, and bilingual-readiness state

#### Scenario: Admin creates and edits event fields through a dialog
- **WHEN** an admin opens the create or edit event dialog
- **THEN** the form exposes bilingual title, summary, content, and address fields
- **AND** the form exposes latitude, longitude, start time, end time, signup deadline, capacity, cover URL or file fields, review status, and publish status
- **AND** saving valid draft or publication-ready input persists the event through shared admin client methods
- **AND** invalid input shows field-specific errors without silently closing the dialog

#### Scenario: Admin attempts to publish incomplete bilingual content
- **WHEN** the admin requests publication while any required bilingual Event field is empty, whitespace-only, or a known placeholder
- **THEN** the UI blocks the publication request or presents the API rejection with actionable field-level feedback
- **AND** draft saving remains available

#### Scenario: Admin actions provide visible feedback and safe loading states
- **WHEN** an admin saves a draft, edits an event, publishes, takes an event offline, republishes, or checks in a ticket
- **THEN** the UI shows a pending state for the affected action
- **AND** repeated clicks are disabled while the request is in flight
- **AND** success shows an Element Plus success message
- **AND** failure shows an Element Plus error message with enough context for manual troubleshooting
- **AND** the table or drawer refreshes after successful mutation

