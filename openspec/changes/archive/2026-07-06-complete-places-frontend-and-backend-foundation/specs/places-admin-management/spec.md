## ADDED Requirements

### Requirement: Maintain places from the admin console

The system SHALL allow administrators to maintain places from the admin console.

#### Scenario: Create or edit a place

- **WHEN** an authorized administrator creates or edits a place
- **THEN** the system stores the updated bilingual place data through the backend
- **AND** the place becomes available to downstream public/admin reads according to its status

### Requirement: Maintain places metadata for discovery surfaces

The system SHALL allow administrators to maintain discovery-related metadata for places.

#### Scenario: Update category, tag, or recommendation state

- **WHEN** an authorized administrator updates a place category, tag, or recommendation-related field
- **THEN** the backend persists the metadata
- **AND** the mobile places module can consume the updated discovery state

### Requirement: Maintain place galleries through backend-controlled media flows

The system SHALL allow administrators to attach place gallery media through the backend-controlled file workflow.

#### Scenario: Attach gallery media to a place

- **WHEN** an authorized administrator uploads and attaches place gallery media
- **THEN** the system stores the file metadata using the backend file flow
- **AND** the place detail payload includes the media required by the mobile detail page
