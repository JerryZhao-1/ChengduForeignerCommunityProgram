## ADDED Requirements

### Requirement: Discover social and operations live provider status SHALL be evidence based
The system SHALL distinguish mock/local social operations readiness from CloudBase live persistence for interactions, follows, profiles, operations metadata, tags, notifications, and analytics.

#### Scenario: Discover social ops live provider is accepted
- **WHEN** CloudBase live provider supports discover social and operations collections and smoke checks pass
- **THEN** deployment documentation records live-accepted status for the verified social/ops scope
- **AND** evidence includes collection names, indexes, API base, request summaries, response envelopes, and known limitations

#### Scenario: Discover social ops live provider is blocked
- **WHEN** any social/ops live provider collection, route, or permission check remains fallback-backed or blocked
- **THEN** deployment documentation records the exact fallback or blocker
- **AND** production readiness is not claimed for that scope
