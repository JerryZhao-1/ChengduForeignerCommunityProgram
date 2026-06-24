## ADDED Requirements

### Requirement: Non-places live provider status SHALL remain explicit
The system SHALL distinguish local/API readiness from CloudBase live provider persistence for non-places modules.

#### Scenario: Non-places providers remain fallback-backed
- **WHEN** events, discover, comments, files, notifications, or auth behavior is validated only through local mock provider, Koa routes, or CloudBase handler fallback behavior
- **THEN** deployment and sprint documentation records those modules as not live-accepted in CloudBase
- **AND** the project does not claim production data readiness for those modules

#### Scenario: Non-places provider is live-accepted
- **WHEN** a non-places module is implemented against real CloudBase dev collections and validated through the dev access domain
- **THEN** documentation records the live collection, data state, API base, request evidence, and remaining blockers for that module
- **AND** the module can be marked live-accepted only for the verified scope
