## ADDED Requirements

### Requirement: Edit existing place records through the admin backend
The system SHALL allow authorized administrators to update existing canonical place records through the backend admin API without creating duplicate place records or bypassing shared validation.

#### Scenario: Authorized partial edit persists canonical place fields
- **WHEN** an authorized administrator sends `PATCH /admin/places/:id` with a valid subset of editable place fields
- **THEN** the backend validates the request with the shared update schema
- **AND** the backend merges only provided fields into the existing place record
- **AND** omitted fields remain unchanged
- **AND** the response returns the updated canonical place with the same `_id` and `community_id`
- **AND** subsequent `GET /admin/places` reads include the updated record

#### Scenario: Published edit updates public browsing surfaces
- **WHEN** an authorized administrator edits a place and the resulting place has `status="published"`
- **THEN** public list, map marker, and detail reads reflect the edited public fields according to their existing public contracts
- **AND** public marker responses remain marker-safe and do not include detail-only or admin-only fields
- **AND** public list and detail responses do not expose admin-only review or volunteer intake metadata

#### Scenario: Draft edit remains hidden from public surfaces
- **WHEN** an authorized administrator edits an existing place and the resulting place has `status="draft"`
- **THEN** the updated place is visible through admin reads
- **AND** the place is absent from public list and map marker reads
- **AND** public detail reads for that place return the standard not-found error

#### Scenario: Invalid edit is rejected without mutation
- **WHEN** an authorized administrator sends `PATCH /admin/places/:id` with an invalid category, invalid URL, invalid status, invalid coordinates, or another payload that violates the shared update schema
- **THEN** the backend returns a validation error using the standard error envelope
- **AND** the existing place record is not mutated

#### Scenario: Missing place id is rejected
- **WHEN** an authorized administrator sends `PATCH /admin/places/:id` for a place id that does not exist
- **THEN** the backend returns a not-found error using the standard error envelope
- **AND** no new place record is created

#### Scenario: Unauthorized edit is rejected
- **WHEN** a caller without the required admin role sends `PATCH /admin/places/:id`
- **THEN** the backend rejects the request with the standard authentication or permission error
- **AND** the existing place record is not mutated
