## ADDED Requirements

### Requirement: Discover core live provider status SHALL be evidence based
The system SHALL distinguish mock/local discover readiness from CloudBase live persistence for posts, comments, and post media.

#### Scenario: Discover core live provider is accepted
- **WHEN** CloudBase live discover collections, indexes, and API smoke checks for core content pass
- **THEN** deployment documentation records discover as live-accepted for posts, comments, owner posts, and post media binding
- **AND** evidence includes API base, request summaries, response envelopes, and collection/index state

#### Scenario: Discover core live provider is not accepted
- **WHEN** any discover core live provider check is still fallback-backed or blocked
- **THEN** deployment documentation records the exact fallback or blocker
- **AND** the project does not claim production data readiness for discover core content
