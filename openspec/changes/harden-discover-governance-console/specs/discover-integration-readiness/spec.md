## ADDED Requirements

### Requirement: Discover report behavior SHALL create governance records
The discover report path SHALL create durable governance records instead of only mutating the reported post status.

#### Scenario: Report creates case and updates visibility
- **WHEN** a user reports a visible post with a valid reason
- **THEN** the system creates a report case
- **AND** public visibility follows the configured launch behavior for reported content

#### Scenario: Admin resolves report
- **WHEN** an authorized admin resolves a report as actioned or rejected
- **THEN** the report case records resolution status, handler, reason, and timestamp
- **AND** content visibility reflects the selected moderation outcome

### Requirement: Discover moderation SHALL include comments
The discover moderation path SHALL govern comments as well as posts.

#### Scenario: Hide a comment
- **WHEN** an authorized admin hides a comment
- **THEN** subsequent public comment reads for that post do not include the comment
- **AND** post and report history retain the moderation record for admin review
