## ADDED Requirements

### Requirement: CloudBase dev places data SHALL be seeded through backend-controlled paths
The system SHALL create or update minimum CloudBase dev `places` data through repository API/admin-controlled paths instead of relying on local mock-only data.

#### Scenario: Import volunteer records as drafts
- **WHEN** the volunteer spreadsheet import is executed against the CloudBase dev API base URL
- **THEN** imported records are created or updated as `draft` places in the CloudBase dev `places` collection
- **AND** each imported record keeps `import_review.source_import_id` so repeated imports do not create uncontrolled duplicates
- **AND** imported records are not publicly visible by default

#### Scenario: Create a published acceptance place
- **WHEN** an authorized dev admin creates or updates a representative place through `/api/admin/places`
- **THEN** the place is persisted in CloudBase dev with `status="published"` and usable coordinates
- **AND** the place has enough bilingual card/detail fields to support public list, map marker, and detail smoke checks

### Requirement: Public CloudBase dev places reads SHALL prove live published visibility
The system SHALL verify public places reads against CloudBase dev live data for published places.

#### Scenario: Published place appears in public list
- **WHEN** a published acceptance place exists in CloudBase dev
- **THEN** `GET /api/places` returns an API envelope containing that place in `data.items`
- **AND** the list item does not include detail-only fields such as `gallery_media`, full navigation objects, or `import_review`

#### Scenario: Published place appears in map markers
- **WHEN** a published acceptance place has usable coordinates
- **THEN** `GET /api/places/map-markers` returns a marker for that place
- **AND** the marker payload remains limited to marker-safe fields

#### Scenario: Published place detail is readable
- **WHEN** a client requests `GET /api/places/:id` for the published acceptance place
- **THEN** the response returns a successful API envelope with detail fields
- **AND** the detail payload includes navigation and share data
- **AND** the detail payload does not expose `import_review`

### Requirement: Draft CloudBase dev places SHALL remain hidden from public reads
The system SHALL verify that CloudBase dev draft places do not leak through public places endpoints.

#### Scenario: Draft place is absent from public list and markers
- **WHEN** a draft imported or seeded place exists in CloudBase dev
- **THEN** `GET /api/places` does not return the draft place
- **AND** `GET /api/places/map-markers` does not return a marker for the draft place

#### Scenario: Draft place detail is not found
- **WHEN** a client requests `GET /api/places/:id` for a draft CloudBase dev place
- **THEN** the API returns a not-found error envelope
- **AND** the response does not expose detail-only fields or review metadata

### Requirement: Admin CloudBase dev updates SHALL be visible through public reads after publication
The system SHALL verify that admin updates persist in CloudBase dev and are reflected by public reads according to publication state.

#### Scenario: Published place update propagates to public reads
- **WHEN** an authorized dev admin updates a published acceptance place through `/api/admin/places/:id`
- **THEN** subsequent public list and detail reads return the updated public fields
- **AND** the map marker reflects updated marker-safe fields when relevant

#### Scenario: Draft update remains private
- **WHEN** an authorized dev admin updates a draft imported place while keeping `status="draft"`
- **THEN** the update is visible through `/api/admin/places`
- **AND** the updated draft remains absent from public list, marker, and detail reads

### Requirement: CloudBase dev gallery media acceptance SHALL use real media evidence or an explicit blocker
The system SHALL distinguish CloudBase gallery media acceptance from fallback URL rendering.

#### Scenario: Gallery file id resolves to public detail media
- **WHEN** a published CloudBase dev place has a real public CloudBase gallery file id that resolves through temporary URL lookup
- **THEN** `GET /api/places/:id` returns `gallery_media` entries with displayable URLs
- **AND** `gallery_urls` is derived from the same resolved `gallery_media`

#### Scenario: Gallery media cannot be verified
- **WHEN** no usable public CloudBase gallery file id is available for the acceptance run
- **THEN** the implementation records the exact gallery blocker in docs and validation evidence
- **AND** the system does not mark CloudBase gallery media acceptance as complete

### Requirement: CloudBase dev live acceptance SHALL produce durable evidence
The system SHALL produce append-only evidence for the 6.18 CloudBase dev places acceptance gate.

#### Scenario: Acceptance evidence is recorded
- **WHEN** live data seeding and public/admin smoke checks are performed
- **THEN** the validation bundle records commands, request URLs, status codes, response summaries, request ids when present, touched place ids, and any blockers
- **AND** `docs/plan.md` and CloudBase deployment docs reflect the actual completed and incomplete acceptance scope
