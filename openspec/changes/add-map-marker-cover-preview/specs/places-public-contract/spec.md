## MODIFIED Requirements

### Requirement: Keep the places marker contract minimal and stable

The system SHALL treat `GET /places/map-markers` as a stable v1 map contract that stays limited to marker-safe fields instead of growing toward the place detail payload.

#### Scenario: Return a marker payload

- **WHEN** the system returns place markers for the public map
- **THEN** each marker includes only id, localized names, nullable cover URL, top-level category, recommendation flag, and coordinates
- **AND** the response does not include detail-only fields such as full address text, intro body, gallery arrays, external media arrays, cover source attribution, or navigation objects

#### Scenario: Return markers in deterministic order

- **WHEN** the system returns the marker list
- **THEN** the result ordering is deterministic across provider paths
- **AND** recommendation state, `recommended_rank`, `name_zh`, `name_en`, and `_id` tiebreaking are applied in that order so marker behavior remains stable

### Requirement: Public place detail SHALL remain the only public places payload with detail media

The system SHALL keep public places list and map marker payloads separate from place detail media.

#### Scenario: Request list and marker payloads

- **WHEN** a client requests `GET /places` or `GET /places/map-markers`
- **THEN** the response does not include `gallery_media`, `gallery_urls`, external media arrays, complete intro bodies, full address bodies, or navigation objects
- **AND** media-backed gallery data is only returned from `GET /places/:id`
- **AND** nullable `cover_url` on list or marker payloads is treated as a lightweight card or marker preview field rather than a gallery media payload

### Requirement: The system SHALL keep the places map marker contract separate from place detail

The system SHALL treat `GET /places/map-markers` as a lightweight marker contract that is not a reused place detail payload.

#### Scenario: Marker response stays lightweight

- **WHEN** the system returns map markers
- **THEN** each marker only contains marker-safe fields such as id, localized name, nullable cover URL, top-level category, recommendation flag, and coordinates
- **AND** the response does not include detail-only fields such as gallery, address body, intro, cover source metadata, external media arrays, or navigation objects

### Requirement: Public place detail SHALL expose externally sourced media separately
The system SHALL include selected external gallery media only in public place detail payloads and SHALL distinguish them from owned gallery media backed by completed file assets.

#### Scenario: Detail includes owned and external media
- **WHEN** a client requests `GET /places/:id` for a published place with both uploaded gallery file ids and selected external gallery media
- **THEN** the detail payload includes owned `gallery_media` entries resolved from file assets
- **AND** the detail payload includes external gallery media entries with image URL and source attribution
- **AND** `gallery_urls` remains derived from owned `gallery_media.url` entries rather than becoming the source of external media ownership

#### Scenario: List and marker exclude external media
- **WHEN** a client requests `GET /places` or `GET /places/map-markers`
- **THEN** the response does not include external gallery media arrays, cover source metadata, owned `gallery_media`, or `gallery_urls`
- **AND** nullable `cover_url` may appear as a lightweight card or marker preview field without exposing external media ownership or attribution metadata
- **AND** list and marker payloads remain bounded to their public surface fields
