## ADDED Requirements

### Requirement: Direct place gallery uploads SHALL be protected and recorded
The system SHALL support direct admin uploads for place gallery images while preserving existing file access boundaries and asset traceability.

#### Scenario: Admin uploads a place gallery file directly
- **WHEN** a `community_admin` or `system_admin` uploads a valid image file for a place gallery through the direct upload path
- **THEN** the backend stores the file in the protected `public/places/` gallery prefix
- **AND** the backend creates a completed active `FileAsset` with visibility, business type, business id, uploader, file id, and cloud path
- **AND** the backend updates the target place `gallery_file_ids` with the new file id

#### Scenario: Non-admin direct upload is denied
- **WHEN** a caller without the required admin role attempts a direct place gallery upload
- **THEN** the backend returns a forbidden error envelope
- **AND** no storage object, `FileAsset`, or place gallery mutation is created

#### Scenario: Invalid direct upload is rejected
- **WHEN** an authorized administrator uploads an unsupported file type, oversized file, missing file body, or targets a missing place id
- **THEN** the backend returns a validation or not-found error envelope
- **AND** no completed active `FileAsset` is registered for that failed upload

#### Scenario: Existing file endpoints remain compatible
- **WHEN** existing clients call `/files/upload-requests`, `/files/complete`, or `/files/private-url`
- **THEN** those endpoints continue to enforce their current public/private and admin-protected path rules
- **AND** the new direct place gallery upload path does not weaken existing file authorization checks
