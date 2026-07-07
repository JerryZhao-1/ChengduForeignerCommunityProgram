## ADDED Requirements

### Requirement: Discover list and detail SHALL expose durable interaction state
The discover list and detail experience SHALL expose durable counters and actor-specific interaction state where the actor is known.

#### Scenario: Render interaction counts
- **WHEN** a client reads a visible post list or detail
- **THEN** the response includes durable like, favorite, comment, and share counts
- **AND** the values match provider-backed state

#### Scenario: Render actor interaction state
- **WHEN** an authenticated actor reads a visible post detail
- **THEN** the response or companion interaction endpoint indicates whether the actor has liked or favorited the post
- **AND** toggling the state survives refresh

### Requirement: Discover ranking SHALL respect operations metadata
The discover feed SHALL support operator-controlled ranking metadata without breaking existing visible-only rules.

#### Scenario: Read curated feed
- **WHEN** posts are pinned, featured, recommended, or official
- **THEN** the discover feed can surface or label those posts according to the configured ranking rule
- **AND** hidden, deleted, reported, or otherwise unavailable posts remain excluded
