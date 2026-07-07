## ADDED Requirements

### Requirement: Discover reports SHALL be durable cases
The system SHALL store reports as durable cases for posts and comments, including reporter, target, reason, description, evidence files, status, handler, resolution, and timestamps.

#### Scenario: User reports a post with evidence
- **WHEN** an authenticated user reports a visible post and attaches evidence files
- **THEN** the system creates a report case linked to the post, reporter, evidence assets, reason, and description
- **AND** the case appears in the admin report queue

#### Scenario: User reports a comment
- **WHEN** an authenticated user reports a visible comment on a visible post
- **THEN** the system creates a report case linked to the comment and parent post
- **AND** the comment remains governed by public visibility rules

### Requirement: Admin discover console SHALL provide moderation queues
The admin discover console SHALL provide actionable queues for posts, comments, reports, users, and moderation history.

#### Scenario: Filter moderation queues
- **WHEN** an authorized admin opens the discover governance console
- **THEN** the console provides tabs or equivalent filters for all posts, visible posts, pending/review posts, reported posts, hidden posts, deleted posts, comments, reports, users, and audit history
- **AND** admins can filter by keyword, author, tag, language, status, report reason, and time window where applicable

#### Scenario: Inspect post detail drawer
- **WHEN** an admin opens a post from a queue
- **THEN** the detail view shows post content, media, author, comments, report cases, moderation history, and public preview context

### Requirement: Admin moderation actions SHALL be role-gated and auditable
The system SHALL support explicit admin moderation actions with role checks and audit records.

#### Scenario: Moderate content
- **WHEN** an authorized admin hides, restores, deletes, or resolves a reported post or comment
- **THEN** the target status changes according to the action
- **AND** an audit record captures actor, target, action, reason, previous state, next state, and timestamp

#### Scenario: Reject unauthorized moderation
- **WHEN** a non-admin actor attempts to call a discover governance action
- **THEN** the API returns a forbidden error envelope
- **AND** no target or audit state is mutated

### Requirement: User governance SHALL support enforcement workflow
The admin discover console SHALL support user review and enforcement for discover safety.

#### Scenario: Review user history
- **WHEN** an authorized admin opens a user governance detail
- **THEN** the system shows user profile summary, post history, comment history, report history, violation history, role flags, and current enforcement status

#### Scenario: Enforce user status
- **WHEN** an authorized admin warns, mutes, bans, or restores a user with a reason
- **THEN** the system updates the user's enforcement state
- **AND** an audit record and notification-ready outcome are created

### Requirement: Governance operations SHALL preserve public visibility boundaries
Governance operations SHALL not expose hidden, deleted, reported, or private evidence data through public discover endpoints.

#### Scenario: Public reads after moderation
- **WHEN** content is hidden, deleted, or otherwise made unavailable through governance
- **THEN** public list, public detail, related content surfaces, and comment reads do not expose that content
- **AND** admin queues remain able to inspect it according to role permissions
