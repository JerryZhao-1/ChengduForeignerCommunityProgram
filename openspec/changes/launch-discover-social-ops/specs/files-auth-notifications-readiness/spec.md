## ADDED Requirements

### Requirement: Notifications SHALL include discover social events
The notifications system SHALL support discover follow and interaction notification cases while avoiding self-notifications and hidden-content leaks.

#### Scenario: Notify followed-user post
- **WHEN** a followed visible user publishes a visible discover post
- **THEN** eligible followers receive a notification linked to that post
- **AND** the author does not receive a self-notification

#### Scenario: Suppress hidden social notification
- **WHEN** a post becomes hidden, deleted, or otherwise unavailable before notification delivery
- **THEN** pending or generated social notifications do not expose hidden content
- **AND** navigation from existing notifications handles unavailable content gracefully
