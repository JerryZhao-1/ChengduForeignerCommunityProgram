# places-admin-management Specification

## Purpose
TBD - created by archiving change stabilize-places-map-v1-and-admin-metadata. Update Purpose after archive.
## Requirements
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

### Requirement: Use a shared top-level category taxonomy for places

The system SHALL treat top-level place categories as a controlled shared taxonomy rather than free-text admin-only metadata.

#### Scenario: Select a top-level category in admin

- **WHEN** an authorized administrator assigns `category_level_1` to a place
- **THEN** the value comes from the shared supported top-level category set
- **AND** the backend accepts supported values and rejects unsupported ones
- **AND** the mobile places browsing surfaces can use the same taxonomy as their filtering truth

### Requirement: Preserve admin ownership over publication and normalization fields

The system SHALL keep publication and editorial normalization decisions under admin control even when place records originate from volunteer collection.

#### Scenario: Review a volunteer-collected place record

- **WHEN** an administrator converts a volunteer submission into a canonical `place` record
- **THEN** publish state, recommendation rank, and finalized bilingual presentation fields remain admin-owned
- **AND** volunteer evidence or confidence metadata does not become a public `place` payload by default

### Requirement: Normalize volunteer-collected place data before publication

The system SHALL require admin review before volunteer-collected inputs are treated as publication-ready place metadata.

#### Scenario: Accept volunteer-provided place fields into admin workflow

- **WHEN** a volunteer submission includes names, address details, hours, contact information, tags, or usage notes
- **THEN** administrators can map those inputs into canonical `place` fields only after review and normalization
- **AND** uncertain, missing, or partially translated inputs do not block intake but must be resolved before publication readiness

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

### Requirement: Preserve admin permissions for gallery attachment

The system SHALL protect place gallery attachment behind the same admin permissions as place maintenance.

#### Scenario: Unauthorized gallery attachment

- **WHEN** a caller without the required admin role attempts to attach gallery media to a place
- **THEN** the system rejects the operation with a permission error
- **AND** the place gallery file ids and registered file assets are not partially mutated through the protected admin path
