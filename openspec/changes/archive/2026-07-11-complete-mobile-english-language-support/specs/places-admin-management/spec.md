## MODIFIED Requirements

### Requirement: Highlight map and publication blockers
The system SHALL make place data issues that block public map or bilingual high-quality detail rendering visible to administrators and SHALL prevent incomplete bilingual Places from becoming or remaining publicly mutated.

#### Scenario: Missing coordinates
- **WHEN** a place has missing or unusable coordinates
- **THEN** the admin workflow indicates that the place cannot produce a public map marker
- **AND** saving the draft remains allowed so the record can be completed later

#### Scenario: Missing optional content
- **WHEN** a place lacks optional gallery media or tags
- **THEN** the admin workflow allows saving while making the missing content clear enough for review
- **AND** optional omissions do not by themselves bypass or trigger the bilingual publication gate

#### Scenario: Missing required bilingual content
- **WHEN** a Place would be `published` after a create, status transition, quick publish, or update and any required bilingual name, address, business-hours, or intro field is empty, whitespace-only, or a known placeholder
- **THEN** the API rejects the mutation with field-level validation details
- **AND** the admin UI identifies each blocking field
- **AND** an incomplete record can still be saved as draft

#### Scenario: Recommended Place lacks bilingual recommendation reason
- **WHEN** a Place would be public and recommended but either recommendation-reason locale is missing or a known placeholder
- **THEN** publication or the published update is rejected
- **AND** the previous public record remains unchanged

#### Scenario: Published Place becomes bilingual-complete
- **WHEN** an administrator supplies all required non-placeholder bilingual values and valid map metadata
- **THEN** the Place can be published or updated while published
- **AND** public list, map, detail, navigation, and share projections continue to respect their existing field boundaries

