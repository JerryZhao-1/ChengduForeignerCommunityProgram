## ADDED Requirements

### Requirement: Public places contracts tolerate imported real-data gaps
The system SHALL keep public places list, marker, and detail responses valid when published real-data records lack optional gallery, tags, recommendation state, or complete address content.

#### Scenario: Return published place without optional fields
- **WHEN** a published place has no gallery media, no tags, and no recommendation state
- **THEN** public list and detail responses remain schema-valid
- **AND** optional collections are returned as empty arrays or nullable values according to the existing contract

#### Scenario: Exclude place without usable marker data
- **WHEN** a published place lacks usable coordinates
- **THEN** it can still be returned by public list and detail if otherwise valid
- **AND** it is excluded from `GET /places/map-markers`

### Requirement: Public places contracts exclude import-only metadata
The system SHALL keep import source metadata and volunteer review evidence out of public places contracts.

#### Scenario: Read imported and published place
- **WHEN** a client reads public data for a place that originated from volunteer import
- **THEN** the response contains only canonical public fields
- **AND** it does not include spreadsheet row identifiers, position proof, collector notes, contact details, or internal review status
