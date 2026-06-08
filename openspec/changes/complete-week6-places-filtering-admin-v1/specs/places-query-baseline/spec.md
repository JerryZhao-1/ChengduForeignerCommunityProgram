## MODIFIED Requirements

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
