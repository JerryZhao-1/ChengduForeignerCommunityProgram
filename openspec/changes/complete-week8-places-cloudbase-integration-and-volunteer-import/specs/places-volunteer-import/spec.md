## ADDED Requirements

### Requirement: Import volunteer spreadsheet records into backend review state
The system SHALL provide a repeatable import path for the volunteer place collection spreadsheet that creates backend-controlled draft or review-intake records without publishing them by default.

#### Scenario: Import spreadsheet records as non-public data
- **WHEN** the Week 8 import is run against `docs/志愿者点位采集表.xlsx`
- **THEN** each usable collected point is converted into a backend draft place or equivalent admin-review intake record
- **AND** imported records are not visible through public list, map marker, or detail reads until an administrator publishes them

#### Scenario: Preserve source traceability
- **WHEN** a spreadsheet row is imported
- **THEN** the system preserves enough source context to identify the source spreadsheet, point column, raw volunteer category, and review-only notes
- **AND** that source context is available for admin review or evidence without being returned in public `places` payloads

### Requirement: Normalize volunteer fields before canonical publication
The system SHALL map volunteer spreadsheet fields into canonical `place` fields only through deterministic normalization and admin-owned publication decisions.

#### Scenario: Map direct and normalized fields
- **WHEN** an imported spreadsheet row includes Chinese name, English alias, category, address, service description, hours, tags, and notes
- **THEN** the system maps direct fields such as confirmed Chinese name and address into draft place fields
- **AND** fields requiring cleanup such as English name, tags, category level 2, intro copy, and business hours remain editable before publication

#### Scenario: Keep duplicate category rows distinct
- **WHEN** the spreadsheet contains multiple rows labeled `点位类型`
- **THEN** the import keeps the volunteer-facing category and internal category-code candidate distinct
- **AND** category normalization uses a documented priority without silently overwriting either source value

#### Scenario: Reject unsupported public categories
- **WHEN** an imported row contains a category that cannot be mapped to the shared top-level category taxonomy
- **THEN** the system keeps the record in draft or review-needed state
- **AND** the backend does not accept the unsupported value as `category_level_1`

### Requirement: Protect public payloads from volunteer evidence
The system SHALL prevent volunteer evidence, contact details, cost notes, and raw collection notes from leaking into public `places` payloads by default.

#### Scenario: Request public data for imported records
- **WHEN** a client requests public list, marker, or detail data
- **THEN** the response excludes review-only fields such as position proof, contact details, cost notes, route notes, collector notes, and raw source metadata
- **AND** only canonical public place fields are returned for records that have been explicitly published

### Requirement: Provide import validation evidence
The system SHALL validate the volunteer import path with reproducible evidence that covers row count, field mapping, unsupported values, and draft visibility.

#### Scenario: Run import validation
- **WHEN** the import validation bundle is executed
- **THEN** it reports the number of parsed point records and the number of records accepted for draft/review intake
- **AND** it asserts that imported records default to non-public state and do not appear in public reads until published
