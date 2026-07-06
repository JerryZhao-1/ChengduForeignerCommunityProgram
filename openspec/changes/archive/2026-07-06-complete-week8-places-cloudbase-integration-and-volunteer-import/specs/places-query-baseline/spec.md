## ADDED Requirements

### Requirement: Week 8 places behavior stays aligned across execution paths
The system SHALL keep Week 8 places list, marker, detail, and admin mutation behavior aligned across mock, Koa, CloudBase handler, and CloudBase provider paths.

#### Scenario: Compare public read behavior
- **WHEN** the same published and draft places are exercised through mock, local HTTP, CloudBase handler, and CloudBase provider paths
- **THEN** public list, marker, and detail visibility rules match across paths
- **AND** list, marker, and detail payload field boundaries remain consistent

#### Scenario: Compare admin mutation behavior
- **WHEN** an authorized admin creates or updates a place through local HTTP and CloudBase handler/provider paths
- **THEN** validation, permission, not-found, draft visibility, publication, and gallery field behavior remain aligned

### Requirement: Week 8 validation covers imported real data
The system SHALL include imported volunteer records in Week 8 places validation without weakening public visibility or marker safety rules.

#### Scenario: Validate imported records
- **WHEN** volunteer-imported records are present in the backend test or dev dataset
- **THEN** draft imported records remain hidden from public reads
- **AND** records without usable coordinates remain excluded from map markers even if later published
