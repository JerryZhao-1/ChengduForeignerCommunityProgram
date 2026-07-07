## ADDED Requirements

### Requirement: Report evidence files SHALL be protected
The file system SHALL support report evidence uploads without exposing evidence through public content payloads.

#### Scenario: Upload report evidence
- **WHEN** an authenticated user attaches image or video evidence to a report
- **THEN** the system stores the evidence file asset under a controlled report evidence biz type or protected path
- **AND** the report case references the evidence file ids

#### Scenario: Admin reads report evidence
- **WHEN** an authorized admin opens a report case with evidence
- **THEN** the system provides admin-authorized temporary access to evidence files
- **AND** public post, comment, list, and detail payloads do not include evidence URLs
