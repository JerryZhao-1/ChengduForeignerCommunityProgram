## ADDED Requirements

### Requirement: Upload place gallery images directly from the admin editor
The system SHALL allow administrators to upload place gallery image files directly from the admin place editor without manually entering a file name or using a separate attach/register mental model.

#### Scenario: Direct upload adds owned gallery file
- **WHEN** an authorized administrator selects an image file for an existing place gallery
- **THEN** the system uploads the file through the backend-controlled place gallery upload path
- **AND** the system creates a completed active `FileAsset`
- **AND** the target place stores the uploaded file id in `gallery_file_ids`
- **AND** subsequent public detail reads can resolve the uploaded file into `gallery_media` and derived `gallery_urls`

#### Scenario: Direct upload preserves existing gallery order
- **WHEN** an authorized administrator uploads a new gallery image to a place that already has gallery file ids
- **THEN** the new file id is appended without removing existing gallery file ids
- **AND** the order returned by public detail matches the persisted gallery order

#### Scenario: Direct upload can be prepared before place creation
- **WHEN** an authorized administrator uploads gallery media before the place record has an id
- **THEN** the system uploads the file through the backend-controlled pending place gallery upload path
- **AND** the system creates a completed active pending `FileAsset`
- **AND** creating the place with the returned file id binds that pending asset to the new place

### Requirement: Manage owned and external gallery media separately in admin
The system SHALL keep uploaded owned gallery files separate from externally sourced image references in the admin place editor.

#### Scenario: View mixed media sources in admin
- **WHEN** an administrator edits a place with both uploaded gallery file ids and external gallery media
- **THEN** the admin editor displays uploaded files and external provider images as distinct source types
- **AND** external media controls do not present provider images as CloudBase file assets

#### Scenario: Remove external gallery reference
- **WHEN** an authorized administrator removes an external gallery image from a place
- **THEN** the system removes only the external media reference
- **AND** existing `gallery_file_ids` and `FileAsset` records remain unchanged

#### Scenario: Remove uploaded gallery file reference
- **WHEN** an authorized administrator removes an uploaded gallery image from a place
- **THEN** the system removes the selected file id from `gallery_file_ids`
- **AND** existing external gallery media references remain unchanged

### Requirement: Select Amap image candidates during place editing
The system SHALL allow administrators to use Amap image candidates while creating or editing a place without replacing the existing Tencent metadata search flow.

#### Scenario: Fill media from Amap candidate
- **WHEN** an authorized administrator searches Amap from the place editor and selects an image candidate
- **THEN** the administrator can choose whether to use the image as external gallery media or as the place cover
- **AND** selecting an image does not overwrite bilingual place text, category, recommendation, publication state, or uploaded gallery file ids unless the administrator explicitly performs a separate edit

#### Scenario: Tencent search remains metadata-only
- **WHEN** an authorized administrator uses the existing Tencent place search
- **THEN** the system continues to fill supported metadata such as Chinese name, Chinese address, coordinates, and Tencent POI id
- **AND** the Tencent search flow is not required to return image candidates
