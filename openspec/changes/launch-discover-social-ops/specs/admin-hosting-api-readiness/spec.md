## ADDED Requirements

### Requirement: Admin readiness SHALL include discover operations and analytics
The hosted admin system SHALL expose discover content operations and analytics through authenticated admin routes.

#### Scenario: Open discover operations dashboard
- **WHEN** an authorized admin opens the hosted admin discover operations page
- **THEN** the page shows content operation controls for curated posts and tag taxonomy
- **AND** the page can save changes through shared API contracts

#### Scenario: Open discover analytics dashboard
- **WHEN** an authorized admin opens discover analytics
- **THEN** the page shows provider-backed metrics for content, engagement, reports, moderation time, popular associations, and pending workload
- **AND** unauthenticated or non-admin actors cannot access the data
