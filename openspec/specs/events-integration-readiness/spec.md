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
The system SHALL let authorized admins create, update, review, publish, and check in events through the BFF without bypassing shared contracts.

#### Scenario: Admin creates and publishes an event
- **WHEN** an authorized admin creates an event and then approves it for publication
- **THEN** the event becomes visible through public event list and detail reads
- **AND** the public response reflects the latest admin-maintained fields

#### Scenario: Non-admin cannot mutate events
- **WHEN** a non-admin actor calls an admin event create, update, review, or check-in route
- **THEN** the API returns a forbidden error envelope
- **AND** protected event, registration, and ticket data is not mutated

### Requirement: Event check-in SHALL enforce ticket validity
The system SHALL validate event-ticket association and ticket state before marking a ticket used.

#### Scenario: Admin checks in a valid ticket
- **WHEN** an authorized admin checks in a valid ticket for the matching event
- **THEN** the ticket status changes to `used`
- **AND** `used_at` is recorded

#### Scenario: Reject invalid check-in
- **WHEN** an admin checks in a missing ticket, a ticket for another event, or an already-used ticket
- **THEN** the API returns a stable error envelope
- **AND** no unrelated ticket state is mutated
