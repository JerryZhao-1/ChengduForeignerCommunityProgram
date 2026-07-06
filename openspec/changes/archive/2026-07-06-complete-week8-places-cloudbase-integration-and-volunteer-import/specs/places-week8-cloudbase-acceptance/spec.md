## ADDED Requirements

### Requirement: Verify complete places flow in CloudBase dev
The system SHALL verify the complete Week 8 `places` flow against CloudBase `dev`, not only mock or local memory providers.

#### Scenario: Public reads succeed in CloudBase dev
- **WHEN** CloudBase `dev` is configured with `API_PROVIDER=cloudbase`, live places mode, and the dev environment id
- **THEN** public places list, map markers, and detail reads return successful API envelopes for seeded or imported places
- **AND** public reads preserve list, marker, and detail field boundaries

#### Scenario: Admin maintenance succeeds in CloudBase dev
- **WHEN** an authorized admin creates or updates a place through the CloudBase dev API path
- **THEN** the change is persisted in the CloudBase `places` collection
- **AND** published changes become visible through public reads while draft changes remain hidden

#### Scenario: Gallery media resolves in CloudBase dev
- **WHEN** a published place has CloudBase gallery file ids
- **THEN** public detail reads return `gallery_media` entries with displayable temporary URLs
- **AND** `gallery_urls` is derived from the same resolved gallery media

### Requirement: Gate HTTP access route creation on formal function deployment
The system SHALL create the CloudBase HTTP access service `/api` route only after `community-map-api` is deployed as the formal dev HTTP function entry.

#### Scenario: Function is still a placeholder
- **WHEN** `community-map-api` is still an Event placeholder or cannot be verified as the `apps/api/src/cloudbase.ts` HTTP function
- **THEN** the `/api` route remains deferred
- **AND** Week 8 evidence records the blocker rather than marking the route complete

#### Scenario: Function deployment is verified
- **WHEN** `community-map-api` is verified as the formal dev HTTP function for the BFF
- **THEN** the CloudBase HTTP access service `/api` route can be created or confirmed
- **AND** the route is recorded in Week 8 deployment documentation with the dev access domain

### Requirement: Record Week 8 deployment and acceptance evidence
The system SHALL produce durable Week 8 evidence for deployment, data import, and places acceptance.

#### Scenario: Capture deployment evidence
- **WHEN** Week 8 CloudBase dev deployment and route checks are performed
- **THEN** documentation records the function name, env id, HTTP access domain, route status, provider mode, and any unresolved blockers
- **AND** evidence is stored in append-only validation bundle folders

#### Scenario: Capture GUI acceptance evidence
- **WHEN** mobile and admin places flows are manually verified through MCP or approved GUI tooling
- **THEN** screenshots or runbook evidence cover list, map, detail, filters, recommendation entry, navigation, favorite/share-ready state, and admin update refresh behavior
- **AND** known simulator limitations are documented explicitly
