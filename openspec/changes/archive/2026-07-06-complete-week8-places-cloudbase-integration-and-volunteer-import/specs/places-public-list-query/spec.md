## ADDED Requirements

### Requirement: Public list queries remain stable with imported drafts
The system SHALL keep imported draft or review-needed records hidden from public list queries until they are explicitly published.

#### Scenario: Query list after volunteer import
- **WHEN** the volunteer spreadsheet has been imported into backend draft or review state
- **THEN** `GET /places` returns only records whose canonical publish state is `published`
- **AND** imported drafts do not affect public list totals, filters, or recommendation results

#### Scenario: Query empty filter combinations
- **WHEN** a category, tag, recommendation, or keyword filter matches no published places
- **THEN** the public list response returns a valid empty paginated result
- **AND** the mobile list displays the empty state without treating it as an error
