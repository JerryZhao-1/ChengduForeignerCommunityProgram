## MODIFIED Requirements

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

### Requirement: Event admin list SHALL support local operator sorting

The system SHALL let administrators sort the currently loaded admin events list by operationally useful fields.

#### Scenario: Sort admin event rows

- **WHEN** an administrator chooses a sort field and direction on the admin events page
- **THEN** the currently loaded rows are ordered by that field and direction
- **AND** supported fields include name, start time, end time, signup deadline, capacity, and remaining capacity
- **AND** resetting filters restores the default loaded order
