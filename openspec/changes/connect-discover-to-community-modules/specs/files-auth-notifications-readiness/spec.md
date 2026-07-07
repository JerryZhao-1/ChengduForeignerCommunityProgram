## ADDED Requirements

### Requirement: Notifications SHALL include discover cross-module events
The notifications system SHALL include discover events that involve places, events, comments, reports, and followed-user activity.

#### Scenario: Receive comment notification
- **WHEN** a discover comment creates a notification for a recipient
- **THEN** the notification includes enough target metadata to navigate to the discover post detail
- **AND** it respects notification ownership on list and mark-read

#### Scenario: Receive associated discussion notification
- **WHEN** a user receives a discover notification related to an event or place they follow or administer
- **THEN** the notification links to the relevant discover post or module detail according to available target metadata
- **AND** it does not expose hidden or deleted content
