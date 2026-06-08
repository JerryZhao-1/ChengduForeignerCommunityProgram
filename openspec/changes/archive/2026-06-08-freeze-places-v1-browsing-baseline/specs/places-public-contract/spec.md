## ADDED Requirements

### Requirement: The system SHALL freeze the places v1 list contract as a card-oriented browsing surface

The system SHALL treat `GET /places` as a stable v1 list contract that accepts only paging and browsing filters, and returns only list-card fields rather than detail-only data.

#### Scenario: List query uses only v1 browsing inputs

- **WHEN** a client sends a places list query
- **THEN** the supported inputs are `page`, `pageSize`, `communityId`, `keyword`, `category`, `tags`, `recommended`, and `sort`
- **AND** `sort` only accepts `recommended` or `name`

#### Scenario: List response excludes detail-only fields

- **WHEN** the system returns a places list item
- **THEN** the payload includes card fields such as localized names, category, short address, summary, tags, recommendation flags, and navigation support
- **AND** the payload does not include gallery arrays, full navigation objects, or other detail-only structures

### Requirement: The system SHALL freeze the places v1 detail contract as the decision-useful place payload

The system SHALL treat `GET /places/:id` as a stable v1 detail contract for decision-useful information about one published place.

#### Scenario: Detail response includes decision-useful fields

- **WHEN** a client requests a published place detail
- **THEN** the payload includes gallery, tags, business hours, address, intro, and navigation fields
- **AND** the payload remains distinct from list and marker surfaces

### Requirement: The system SHALL keep the places map marker contract separate from place detail

The system SHALL treat `GET /places/map-markers` as a lightweight marker contract that is not a reused place detail payload.

#### Scenario: Marker response stays lightweight

- **WHEN** the system returns map markers
- **THEN** each marker only contains marker-safe fields such as id, localized name, top-level category, recommendation flag, and coordinates
- **AND** the response does not include detail-only fields such as gallery, address body, intro, or navigation objects
