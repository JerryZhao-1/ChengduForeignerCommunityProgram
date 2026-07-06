## ADDED Requirements

### Requirement: Keep shared contracts as the single source of truth

The system SHALL require affected cross-app payload changes to originate from shared contracts and schemas.

#### Scenario: Change a cross-app payload

- **WHEN** a places, events, discover, files, auth, or notifications payload changes
- **THEN** the shared contract/schema layer is updated before app-specific consumers or providers
- **AND** downstream implementations consume the updated shared definition

### Requirement: Keep provider behavior aligned across execution modes

The system SHALL keep backend behavior aligned across mock, Koa, and CloudBase execution paths for affected capabilities.

#### Scenario: Execute the same route through different backend modes

- **WHEN** the same affected API capability is exercised through mock-backed and HTTP/CloudBase-backed paths
- **THEN** the system returns the same envelope shape and equivalent business behavior
- **AND** differences are treated as defects

### Requirement: Enforce validation and permission behavior for integration-critical routes

The system SHALL provide predictable validation and permission behavior for integration-critical routes.

#### Scenario: Call an admin route without permission

- **WHEN** a caller without the required role attempts an affected admin action
- **THEN** the system rejects the request with a permission error
- **AND** does not mutate protected business data

#### Scenario: Call an affected route with invalid input

- **WHEN** a caller sends invalid input to an affected route
- **THEN** the system rejects the request with a validation error
- **AND** does not process a partial business update
