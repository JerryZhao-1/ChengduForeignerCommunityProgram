# places-query-baseline Specification

## Purpose
TBD - created by archiving change freeze-places-v1-browsing-baseline. Update Purpose after archive.
## Requirements
### Requirement: The system SHALL expose a stable public places query baseline across provider paths

The system SHALL keep `places` public read behavior aligned across mock provider, Koa routes, CloudBase handler, and CloudBase provider for the v1 browsing baseline.

#### Scenario: Public list filters published places for the target community

- **WHEN** a client requests the places list for a community
- **THEN** the system returns only `published` places for that `communityId`
- **AND** applies pagination, keyword, category, tag, recommendation, and v1 sort semantics consistently across provider paths

#### Scenario: Detail hides unpublished places

- **WHEN** a client requests a place detail that does not exist or is not published
- **THEN** the system returns a not-found response
- **AND** does not leak unpublished place content through the public detail endpoint

#### Scenario: Marker endpoint stays aligned with public visibility rules

- **WHEN** a client requests map markers
- **THEN** the system returns only published markers for the active community
- **AND** the result set follows the same visibility rules as the public list and detail endpoints

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
