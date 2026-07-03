# files-auth-notifications-readiness Specification

## Purpose
Define local/API readiness requirements for file access boundaries, actor resolution, admin role checks, and notification ownership.

## Requirements
### Requirement: File flows SHALL enforce public and private access boundaries
The system SHALL protect private files and privileged upload targets while allowing supported public file flows.

#### Scenario: Create and complete public upload
- **WHEN** an allowed actor creates and completes a public upload request for a supported public path
- **THEN** the API returns a completed active file asset
- **AND** the asset records visibility, business type, business id, uploader, and cloud path

#### Scenario: Public actor cannot use protected admin file paths
- **WHEN** a non-admin actor attempts to create or complete a protected place gallery, private export, ticket, or admin file operation
- **THEN** the API returns a forbidden error envelope
- **AND** no protected file asset is registered

#### Scenario: Private URL denies public access
- **WHEN** an actor requests a private URL for a missing file or a file they are not allowed to read
- **THEN** the API returns a forbidden or not-found error envelope
- **AND** no temporary private URL is returned

### Requirement: Auth actor resolution SHALL fail safely for invalid actors
The system SHALL resolve request actors predictably and reject invalid actor identities instead of silently downgrading to a default user.

#### Scenario: Resolve known actor
- **WHEN** a request includes a known mock actor header
- **THEN** the API resolves that actor and applies that actor's role flags and ownership checks

#### Scenario: Reject invalid actor
- **WHEN** a request includes an unknown, inactive, or otherwise invalid actor identity
- **THEN** the API returns an unauthorized error envelope
- **AND** protected route handlers do not execute business mutations

### Requirement: Admin role checks SHALL protect integration-critical mutations
The system SHALL require admin roles for protected event, discover, place gallery, file, and operational mutation routes.

#### Scenario: Non-admin calls protected route
- **WHEN** a non-admin actor calls a protected route
- **THEN** the API returns a forbidden error envelope
- **AND** the route does not mutate protected data

#### Scenario: Admin calls protected route
- **WHEN** an actor with `community_admin` or `system_admin` calls a protected route with valid input
- **THEN** the API evaluates the request against business rules and either completes the mutation or returns a specific validation, not-found, conflict, or forbidden error

### Requirement: Notifications SHALL support list and read-state ownership
The system SHALL expose notifications only to their owning actor and support read-state updates without leaking other users' notifications.

#### Scenario: User lists own notifications
- **WHEN** a user requests `GET /notifications`
- **THEN** the API returns only notifications belonging to that user
- **AND** each item includes its current read state

#### Scenario: User marks own notification as read
- **WHEN** a user marks their own unread notification as read
- **THEN** the API updates the notification status to `read`
- **AND** subsequent list reads reflect the updated status

#### Scenario: User cannot mark another user's notification
- **WHEN** a user attempts to mark another user's notification as read
- **THEN** the API returns a not-found or forbidden error envelope
- **AND** the other user's notification state is not changed

### Requirement: Direct place gallery uploads SHALL be protected and recorded
The system SHALL support direct admin uploads for place gallery images while preserving existing file access boundaries and asset traceability.

#### Scenario: Admin uploads a place gallery file directly
- **WHEN** a `community_admin` or `system_admin` uploads a valid image file for a place gallery through the direct upload path
- **THEN** the backend stores the file in the protected `public/places/` gallery prefix
- **AND** the backend creates a completed active `FileAsset` with visibility, business type, business id, uploader, file id, and cloud path
- **AND** the backend updates the target place `gallery_file_ids` with the new file id

#### Scenario: Non-admin direct upload is denied
- **WHEN** a caller without the required admin role attempts a direct place gallery upload
- **THEN** the backend returns a forbidden error envelope
- **AND** no storage object, `FileAsset`, or place gallery mutation is created

#### Scenario: Invalid direct upload is rejected
- **WHEN** an authorized administrator uploads an unsupported file type, oversized file, missing file body, or targets a missing place id
- **THEN** the backend returns a validation or not-found error envelope
- **AND** no completed active `FileAsset` is registered for that failed upload

#### Scenario: Existing file endpoints remain compatible
- **WHEN** existing clients call `/files/upload-requests`, `/files/complete`, or `/files/private-url`
- **THEN** those endpoints continue to enforce their current public/private and admin-protected path rules
- **AND** the new direct place gallery upload path does not weaken existing file authorization checks
