# places-public-contract Specification

## Purpose
TBD - created by archiving change stabilize-places-map-v1-and-admin-metadata. Update Purpose after archive.
## Requirements
### Requirement: Keep the places marker contract minimal and stable

The system SHALL treat `GET /places/map-markers` as a stable v1 map contract that stays limited to marker-safe fields instead of growing toward the place detail payload.

#### Scenario: Return a marker payload

- **WHEN** the system returns place markers for the public map
- **THEN** each marker includes only id, localized names, top-level category, recommendation flag, and coordinates
- **AND** the response does not include detail-only fields such as full address text, intro body, gallery arrays, or navigation objects

#### Scenario: Return markers in deterministic order

- **WHEN** the system returns the marker list
- **THEN** the result ordering is deterministic across provider paths
- **AND** recommendation state, `recommended_rank`, `name_zh`, `name_en`, and `_id` tiebreaking are applied in that order so marker behavior remains stable

### Requirement: Only return displayable public markers

The system SHALL expose only displayable places through the public marker endpoint.

#### Scenario: Filter out non-displayable markers

- **WHEN** a client requests public map markers
- **THEN** the system returns only places in the active community that are `published` and have usable coordinates
- **AND** unpublished places or places without valid map coordinates do not appear in the marker response

### Requirement: Public place detail SHALL include structured media-backed gallery data

The system SHALL expose place detail gallery media as structured media data derived from registered file assets.

#### Scenario: Return place detail with gallery media

- **WHEN** a client requests `GET /places/:id` for a published place with active public gallery file assets
- **THEN** the detail payload includes `gallery_media` entries with displayable image URLs and file traceability fields
- **AND** `gallery_urls`, when present, is derived from the same resolved gallery media instead of separately stored manual URL text

#### Scenario: Return place detail with no gallery media

- **WHEN** a client requests `GET /places/:id` for a published place without active public gallery file assets
- **THEN** the detail payload returns empty gallery media data
- **AND** the response remains valid for the mobile detail page

### Requirement: Public place detail SHALL remain the only public places payload with detail media

The system SHALL keep public places list and map marker payloads separate from place detail media.

#### Scenario: Request list and marker payloads

- **WHEN** a client requests `GET /places` or `GET /places/map-markers`
- **THEN** the response does not include `gallery_media`, `gallery_urls`, complete intro bodies, full address bodies, or navigation objects
- **AND** media-backed gallery data is only returned from `GET /places/:id`

### Requirement: Public place detail SHALL enforce published visibility

The system SHALL only expose media-backed place details for published places in the active community.

#### Scenario: Request an unpublished place detail

- **WHEN** a client requests `GET /places/:id` for a draft or otherwise unpublished place
- **THEN** the system rejects the request as not found
- **AND** the response does not expose gallery media or other detail-only fields

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

