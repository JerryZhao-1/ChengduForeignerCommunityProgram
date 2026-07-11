# events-integration-readiness Specification

## Purpose
Define local/API readiness requirements for the events launch flow, including public visibility, registration guards, ticket ownership, admin maintenance, and check-in validation.
## Requirements
### Requirement: Events public reads SHALL expose only launch-visible events
The system SHALL keep public event list and detail reads limited to events that are intended for public browsing in the target community.

#### Scenario: Public list hides non-public events
- **WHEN** a client requests `GET /events`
- **THEN** the response contains only events for the requested `communityId` whose review and publication states allow public browsing
- **AND** draft, rejected, offline, or otherwise non-public events are absent from `data.items`

#### Scenario: Public detail hides non-public events
- **WHEN** a client requests `GET /events/:id` for a missing or non-public event
- **THEN** the API returns a not-found error envelope
- **AND** the response does not expose hidden event content

### Requirement: Event registration SHALL enforce launch business guards
The system SHALL reject registrations that cannot safely create a confirmed registration and valid private ticket.

#### Scenario: Register for a public event
- **WHEN** an authenticated user submits valid registration input for a public event with remaining capacity
- **THEN** the API creates one confirmed registration for that user and event
- **AND** the API creates a valid private ticket linked to that registration
- **AND** the response uses the standard success envelope

#### Scenario: Reject duplicate registration
- **WHEN** the same user attempts to register twice for the same event while an active registration already exists
- **THEN** the API rejects the second request with a conflict error envelope
- **AND** no second ticket is created

#### Scenario: Reject registration for unavailable event
- **WHEN** a user attempts to register for a missing, non-public, full, or closed event
- **THEN** the API returns a stable error envelope
- **AND** no partial registration or ticket is created

### Requirement: Event ticket reads SHALL enforce ownership and existence
The system SHALL keep ticket retrieval limited to the owning actor or authorized administrative flows.

#### Scenario: User reads own ticket
- **WHEN** a user requests `GET /events/registrations/:id/ticket` for their own registration
- **THEN** the API returns the linked private ticket in a success envelope

#### Scenario: User cannot read another user's ticket
- **WHEN** a user requests a ticket for another user's registration
- **THEN** the API rejects the request with a forbidden or not-found error envelope
- **AND** the response does not expose private ticket file identifiers beyond the allowed error details

### Requirement: Event admin maintenance SHALL support minimum launch operations

The system SHALL let authorized admins create, update, review, publish, check in, sort, and delete events through the BFF and admin console without bypassing shared contracts.

#### Scenario: Admin creates and publishes an event

- **WHEN** an authorized admin creates an event and then approves it for publication
- **THEN** the event becomes visible through public event list and detail reads
- **AND** the public response reflects the latest admin-maintained fields

#### Scenario: Admin deletes an event

- **WHEN** a `community_admin` or `system_admin` sends `DELETE /admin/events/:id` for an existing event
- **THEN** the system removes the event record from subsequent admin and public event reads
- **AND** returns a standard success envelope containing the deleted event id
- **AND** existing registration and ticket records are not cascade-deleted by this operation

#### Scenario: Missing event delete returns not found

- **WHEN** an authorized admin sends `DELETE /admin/events/:id` for a missing event
- **THEN** the system returns `404 NOT_FOUND`
- **AND** no other event, registration, or ticket records are changed

#### Scenario: Non-admin cannot mutate events

- **WHEN** a non-admin actor calls an admin event create, update, review, check-in, or delete route
- **THEN** the API returns a forbidden error envelope
- **AND** protected event, registration, and ticket data is not mutated

### Requirement: Event check-in SHALL enforce ticket validity

The system SHALL validate event-ticket association and ticket state before marking a ticket used, and the admin console SHALL make used ticket state visible to operators.

#### Scenario: Admin checks in a valid ticket

- **WHEN** an authorized admin checks in a valid ticket for the matching event
- **THEN** the ticket status changes to `used`
- **AND** `used_at` is recorded
- **AND** the admin registration list marks the attendee as checked in and places them after unchecked attendees

#### Scenario: Reject invalid check-in

- **WHEN** an admin checks in a missing ticket, a ticket for another event, or an already-used ticket
- **THEN** the API returns a stable error envelope
- **AND** no unrelated ticket state is mutated

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

### Requirement: Event registration management SHALL support admin inspection and check-in
The system SHALL let authorized admins inspect registrations for an event and check in tickets from the backoffice.

#### Scenario: Admin lists registrations for an event
- **WHEN** an authorized admin requests `GET /admin/events/:id/registrations`
- **THEN** the API returns a standard success envelope with registrations for that event
- **AND** each row includes registration status, contact name, contact phone, attendee count, source channel, linked ticket id, ticket code, ticket status, and used time when available
- **AND** missing event ids return a standard not-found error envelope

#### Scenario: Admin opens registration details from the Events page
- **WHEN** an admin opens the registration drawer or detail panel for an event
- **THEN** the UI displays that event's registrations with user/contact data and ticket state
- **AND** empty registration lists render an explicit empty state
- **AND** loading or failed registration fetches render clear states instead of leaving a blank panel

#### Scenario: Admin checks in a valid ticket from the backoffice
- **WHEN** an authorized admin submits a valid ticket id for the matching event
- **THEN** the backend marks the ticket as `used`
- **AND** `used_at` is recorded
- **AND** the UI refreshes the registration list and shows a success message

#### Scenario: Admin sees clear errors for invalid or repeated check-in
- **WHEN** an admin submits a missing ticket, a ticket for another event, or an already-used ticket
- **THEN** the API returns a stable error envelope
- **AND** no unrelated ticket state is mutated
- **AND** the UI shows an error message rather than appearing unresponsive

### Requirement: Event admin list SHALL support local operator sorting

The system SHALL let administrators sort the currently loaded admin events list by operationally useful fields.

#### Scenario: Sort admin event rows

- **WHEN** an administrator chooses a sort field and direction on the admin events page
- **THEN** the currently loaded rows are ordered by that field and direction
- **AND** supported fields include name, start time, end time, signup deadline, capacity, and remaining capacity
- **AND** resetting filters restores the default loaded order

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

