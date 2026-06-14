## ADDED Requirements

### Requirement: Detail renders real-data edge cases gracefully
The system SHALL render published place details gracefully when optional real-data fields are missing or empty.

#### Scenario: Detail has no gallery
- **WHEN** a published place detail has empty `gallery_media` and `gallery_urls`
- **THEN** the mobile detail page does not show broken images, raw file ids, or raw URLs
- **AND** the rest of the available detail content remains usable

#### Scenario: Detail has no tags or recommendation
- **WHEN** a published place detail has no tags and is not recommended
- **THEN** the mobile detail page omits or empties those optional visual sections cleanly
- **AND** primary actions such as navigation, favorite state, and share-ready behavior remain stable

#### Scenario: Detail has incomplete address content
- **WHEN** a published place detail has incomplete address text but valid coordinates
- **THEN** the mobile detail page uses available address and name fields for display and navigation
- **AND** missing address copy does not break page layout or navigation fallback behavior

### Requirement: Detail verifies CloudBase gallery media resolution
The system SHALL verify that CloudBase live detail reads can resolve gallery file ids into displayable media.

#### Scenario: Read CloudBase detail with gallery file ids
- **WHEN** a published CloudBase dev place has `gallery_file_ids`
- **THEN** the detail endpoint resolves them through CloudBase temporary file URLs
- **AND** the mobile detail page renders the returned `gallery_media` as images
