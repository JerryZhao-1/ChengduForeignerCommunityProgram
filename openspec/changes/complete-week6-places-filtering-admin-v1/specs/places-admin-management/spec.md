## MODIFIED Requirements

### Requirement: Maintain map-driving place metadata from the admin console

The system SHALL allow administrators to maintain the place metadata required by public map, list, and detail browsing surfaces.

#### Scenario: Create or edit place map metadata

- **WHEN** an authorized administrator creates or edits a place
- **THEN** the system persists bilingual names, bilingual intro, coordinates, Tencent POI reference, top-level category, second-level category, tags, recommendation state, recommendation reason, recommendation rank, and publish state through the backend
- **AND** downstream public browsing surfaces can consume those values according to public visibility rules

#### Scenario: Publish a maintained place

- **WHEN** an authorized administrator changes a maintained place to `published`
- **THEN** the place can appear in public list, recommendation, tag/category filtered list, map marker, and detail reads according to the public contracts
- **AND** draft or unpublished places remain hidden from those public surfaces

### Requirement: Maintain place gallery media through the files flow

The system SHALL allow administrators to attach place gallery media through completed file assets rather than manually entered gallery URL text.

#### Scenario: Attach gallery media to a place

- **WHEN** an authorized administrator uploads or registers gallery media for a place
- **THEN** the system creates or uses a completed active file asset through the files flow
- **AND** the place stores gallery ownership using `gallery_file_ids`
- **AND** downstream place detail reads can resolve those file ids into displayable gallery media

#### Scenario: Save place gallery changes

- **WHEN** an authorized administrator saves gallery changes for a place
- **THEN** the admin payload persists attached file ids rather than a comma-separated gallery URL text field
- **AND** manually typed gallery URL text is not required to render the mobile place detail gallery

#### Scenario: Return attached gallery media from public detail

- **WHEN** an authorized administrator registers or attaches place gallery media and the place is published
- **THEN** `GET /places/:id` returns `gallery_media` entries with displayable URLs for the mobile detail page
- **AND** `gallery_urls` is derived from the same resolved media entries
