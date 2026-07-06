## MODIFIED Requirements

### Requirement: Event admin maintenance SHALL support minimum launch operations
The system SHALL let authorized admins list, create, update, review, publish, unpublish, republish, and check in events through the BFF without bypassing shared contracts, while keeping public event reads limited to launch-visible events.

#### Scenario: Admin list includes management-only event states
- **WHEN** an authorized admin requests `GET /admin/events`
- **THEN** the API returns a standard success envelope containing events across draft, pending review, approved, published, offline, and ended management states
- **AND** each item includes current active registration count, confirmed attendee count, remaining capacity, and whether the event is full
- **AND** the response includes records that public `GET /events` would hide
- **AND** the response does not require callers to bypass the BFF or shared client

#### Scenario: Admin creates a draft event that remains public-hidden
- **WHEN** an authorized admin creates an event through the admin Events workflow
- **THEN** the backend validates the request with the shared create schema
- **AND** the event is stored as an admin-visible draft unless explicitly published by a valid review action
- **AND** subsequent `GET /admin/events` reads include the draft
- **AND** public list and detail reads do not expose the draft

#### Scenario: Admin edits canonical event fields
- **WHEN** an authorized admin edits an existing event with a valid subset of editable fields
- **THEN** the backend validates the request with the shared update schema
- **AND** only provided fields are changed
- **AND** omitted fields remain unchanged
- **AND** subsequent admin reads return the updated event with the same `_id`

#### Scenario: Admin publishes an event for public mobile browsing
- **WHEN** an authorized admin approves an event with `publish_status="published"`
- **THEN** the event becomes visible through public event list and detail reads
- **AND** mobile Events pages can load the published event through the public client
- **AND** public responses reflect the latest admin-maintained fields

#### Scenario: Admin takes an event offline and republishes it
- **WHEN** an authorized admin sets a published event to `publish_status="offline"`
- **THEN** public list and detail reads hide that event
- **AND** admin reads still include that event with its offline state
- **WHEN** an authorized admin sets the same event back to `publish_status="published"` with an approved review state
- **THEN** public list and detail reads expose the event again

#### Scenario: Non-admin cannot use event admin operations
- **WHEN** a caller without the required admin role calls an event admin list, create, update, review, registration-list, or check-in route
- **THEN** the API returns a standard authentication or permission error envelope
- **AND** protected event, registration, and ticket data is not mutated

## ADDED Requirements

### Requirement: Events backoffice UI SHALL support basic admin event management
The admin Events page SHALL provide a usable management interface for event listing, filtering, creation, editing, publication state changes, and user feedback.

#### Scenario: Admin views and filters all event states
- **WHEN** an admin opens the Events management page
- **THEN** the page loads events from the admin list API
- **AND** draft and non-public events are visible to the admin
- **AND** filters allow narrowing by review status, publish status, keyword, drafts, and published events
- **AND** the table displays event time, signup deadline, capacity, current registration count, and full-capacity state

#### Scenario: Admin creates and edits event fields through a dialog
- **WHEN** an admin opens the create or edit event dialog
- **THEN** the form exposes bilingual title, summary, and content fields
- **AND** the form exposes address, latitude, longitude, start time, end time, signup deadline, capacity, cover URL or file fields, review status, and publish status
- **AND** saving valid input persists the event through shared admin client methods
- **AND** invalid input shows a clear error without silently closing the dialog

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
