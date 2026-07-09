## ADDED Requirements

### Requirement: Events production acceptance SHALL cover true-device registration and ticket flows
The Events module SHALL be validated on true Mini Program devices from public browsing through registration, ticket lookup, my registrations, and Admin check-in against the production-like API target.

#### Scenario: User registers and presents a ticket
- **WHEN** a true-device user opens Events, views a launch-visible event, registers, opens My Registrations, and opens the issued ticket
- **THEN** the UI shows the registration and ticket state consistently and the API evidence records the registration and ticket identifiers

#### Scenario: Admin checks in a true-device registration
- **WHEN** an Admin operator uses the backoffice check-in flow for the ticket generated during true-device testing
- **THEN** the check-in succeeds once, repeated check-in is rejected clearly, and the evidence bundle records the Admin result

#### Scenario: Events true-device flow fails
- **WHEN** registration, ticket lookup, My Registrations, or Admin check-in fails on the production-like target
- **THEN** production acceptance for Events remains blocked until the error is fixed or explicitly scoped out of launch
