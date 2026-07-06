## ADDED Requirements

### Requirement: Review imported volunteer place drafts in admin
The system SHALL allow administrators to identify and complete imported volunteer place records before publication.

#### Scenario: Inspect imported draft quality
- **WHEN** an administrator views imported volunteer place drafts
- **THEN** the admin surface exposes the canonical fields that need completion, including category, coordinates, address, bilingual content, tags, gallery attachment, and publish state
- **AND** the administrator can keep incomplete records in draft without exposing them publicly

#### Scenario: Complete an imported draft
- **WHEN** an administrator normalizes an imported record and saves required public fields
- **THEN** the backend persists the completed canonical place fields
- **AND** the administrator can publish the place only through the admin-owned publication state

### Requirement: Highlight map and publication blockers
The system SHALL make place data issues that block public map or high-quality detail rendering visible to administrators.

#### Scenario: Missing coordinates
- **WHEN** a place has missing or unusable coordinates
- **THEN** the admin workflow indicates that the place cannot produce a public map marker
- **AND** saving the draft remains allowed so the record can be completed later

#### Scenario: Missing optional content
- **WHEN** a place lacks gallery media, tags, recommendation state, or English fields
- **THEN** the admin workflow allows saving while making the missing content clear enough for review
- **AND** public surfaces degrade according to their contracts when the place is eventually published
