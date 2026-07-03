# place-external-media-sources Specification

## Purpose
Define how place imagery from external providers is searched, stored, attributed, and kept separate from community-owned file assets.

## Requirements
### Requirement: Admin place search SHALL expose Amap image candidates
The system SHALL allow authorized administrators to search Amap place candidates through the backend and receive normalized image candidates without exposing Amap credentials to the browser.

#### Scenario: Search Amap place images from admin
- **WHEN** a `community_admin` or `system_admin` searches Amap place candidates with a non-empty keyword
- **THEN** the backend returns a standard success envelope containing normalized place candidates
- **AND** candidates that include provider photos expose image URL, optional image title, source provider, source place id, and display attribution fields
- **AND** the response does not expose provider credentials or raw unvalidated upstream payloads

#### Scenario: Amap search is unavailable
- **WHEN** Amap credentials are missing or the upstream Amap request fails
- **THEN** the backend returns a standard configuration or upstream error envelope
- **AND** existing Tencent place search remains independent and usable when its own configuration is valid

### Requirement: External place images SHALL remain externally sourced references
The system SHALL store selected external provider images as attributed references rather than CloudBase file assets.

#### Scenario: Select external image for gallery
- **WHEN** an authorized administrator selects an Amap image candidate for a place gallery
- **THEN** the place stores the image in an external gallery media field with provider source, source place id, image URL, optional title, and attribution metadata
- **AND** the system does not create a `FileAsset`, does not append the image to `gallery_file_ids`, and does not upload the image to CloudBase storage

#### Scenario: Select external image as cover
- **WHEN** an authorized administrator selects an Amap image candidate as a place cover
- **THEN** the place saves the candidate URL as `cover_url`
- **AND** the place stores enough source metadata for public detail surfaces to identify the cover as externally sourced
- **AND** the system does not claim the cover as a community-owned file asset unless a separate uploaded cover file is used

#### Scenario: Reject unsupported external media source
- **WHEN** a client attempts to save an external image source that is not supported by the shared schema
- **THEN** the backend returns a validation error envelope
- **AND** the existing place media fields are not mutated

### Requirement: External image display SHALL include source attribution
The system SHALL expose and render provider attribution whenever externally sourced place imagery is displayed publicly.

#### Scenario: Public detail returns external gallery media
- **WHEN** a published place has selected external gallery media
- **THEN** `GET /places/:id` returns the external media entries with image URLs and source attribution
- **AND** the payload distinguishes those entries from owned `gallery_media` entries backed by file assets

#### Scenario: Public detail returns externally sourced cover metadata
- **WHEN** a published place uses an externally sourced `cover_url`
- **THEN** `GET /places/:id` returns enough cover source metadata for the client to render provider attribution
- **AND** list and marker payloads do not include external gallery media details
