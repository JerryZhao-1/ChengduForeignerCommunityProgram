## ADDED Requirements

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
- **AND** list and marker payloads remain bounded to their existing public surface fields

### Requirement: Public place detail SHALL expose cover source metadata when needed
The system SHALL expose enough source metadata for clients to attribute externally sourced cover images on public detail surfaces.

#### Scenario: Detail includes external cover source
- **WHEN** a published place uses an externally sourced cover image
- **THEN** `GET /places/:id` includes the existing `cover_url`
- **AND** the detail payload includes source metadata identifying the external provider and attribution label for that cover

#### Scenario: Detail includes owned or manual cover without external attribution
- **WHEN** a published place uses an owned or manually maintained cover image with no external provider metadata
- **THEN** `GET /places/:id` remains valid
- **AND** the detail payload does not require external cover attribution fields to be present
