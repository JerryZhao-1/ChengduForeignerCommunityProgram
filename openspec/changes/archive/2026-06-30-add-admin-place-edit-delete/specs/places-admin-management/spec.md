## ADDED Requirements

### Requirement: Edit existing admin-managed places through the backend
The system SHALL allow authorized administrators to edit existing canonical place records through the backend admin API while preserving shared validation, authorization, and public projection boundaries.

#### Scenario: Authorized admin edits an existing place
- **WHEN** a `community_admin` or `system_admin` sends `PATCH /admin/places/:id` with a valid subset of editable place fields
- **THEN** the system validates the request with the shared update schema
- **AND** persists only the defined updated fields while preserving the place `_id`, `community_id`, and omitted fields
- **AND** returns the updated canonical `Place` inside the standard success envelope
- **AND** subsequent `GET /admin/places` reads include the updated record

#### Scenario: Invalid edit is rejected without mutation
- **WHEN** an authorized administrator sends `PATCH /admin/places/:id` with invalid place field values
- **THEN** the system returns a validation error envelope
- **AND** the existing place record remains unchanged

#### Scenario: Missing place edit returns not found
- **WHEN** an authorized administrator sends `PATCH /admin/places/:id` for a place id that does not exist
- **THEN** the system returns `404 NOT_FOUND`
- **AND** no new place record is created

#### Scenario: Unauthorized edit is rejected
- **WHEN** a caller without `community_admin` or `system_admin` role sends `PATCH /admin/places/:id`
- **THEN** the system returns an authorization error envelope
- **AND** the existing place record remains unchanged

#### Scenario: Published edit updates public reads without leaking admin-only fields
- **WHEN** an authorized administrator edits a published place through `PATCH /admin/places/:id`
- **THEN** public list, map marker, and detail reads reflect the edited public fields according to their existing contracts
- **AND** public responses do not expose admin-only or detail-only fields outside their current payload boundaries

### Requirement: Delete existing admin-managed places through the backend
The system SHALL allow authorized administrators to delete existing canonical place records through the backend admin API.

#### Scenario: Authorized admin deletes an existing place
- **WHEN** a `community_admin` or `system_admin` sends `DELETE /admin/places/:id` for an existing place
- **THEN** the system removes the canonical place record from the active provider
- **AND** returns a standard success envelope containing the deleted place id
- **AND** subsequent `GET /admin/places` reads no longer include that place

#### Scenario: Deleted place is hidden from public reads
- **WHEN** an authorized administrator deletes a published place through `DELETE /admin/places/:id`
- **THEN** the place is absent from public list and map marker reads
- **AND** `GET /places/:id` for that id returns `404 NOT_FOUND`
- **AND** public payload shapes for other places remain unchanged

#### Scenario: Missing place delete returns not found
- **WHEN** an authorized administrator sends `DELETE /admin/places/:id` for a place id that does not exist
- **THEN** the system returns `404 NOT_FOUND`
- **AND** no other place records are removed or changed

#### Scenario: Unauthorized delete is rejected
- **WHEN** a caller without `community_admin` or `system_admin` role sends `DELETE /admin/places/:id`
- **THEN** the system returns an authorization error envelope
- **AND** the existing place record remains visible through admin and applicable public reads

#### Scenario: Delete contract is available through shared API definitions
- **WHEN** clients use the shared API contracts and path helpers
- **THEN** the admin delete place endpoint is exposed as `DELETE /admin/places/:id`
- **AND** the shared client can call the endpoint without defining app-local duplicate paths or DTOs
