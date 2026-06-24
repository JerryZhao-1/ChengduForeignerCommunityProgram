## ADDED Requirements

### Requirement: Discover public feed SHALL expose only visible content
The system SHALL keep public discover list and detail reads limited to content that is visible to community users.

#### Scenario: Public feed hides moderated content
- **WHEN** a client requests `GET /discover/posts`
- **THEN** the response contains only visible posts for the requested `communityId`
- **AND** reported, hidden, deleted, or review-only posts are absent from `data.items`

#### Scenario: Public detail hides moderated content
- **WHEN** a client requests `GET /discover/posts/:id` for a missing, hidden, deleted, or non-visible post
- **THEN** the API returns a not-found error envelope
- **AND** the response does not expose moderated post content

### Requirement: Discover post creation SHALL enter a controlled publication state
The system SHALL create user-generated posts through the BFF with a deterministic initial moderation state.

#### Scenario: User creates a post
- **WHEN** an authenticated user submits valid post input
- **THEN** the API creates the post with the actor as author
- **AND** the post receives the configured launch moderation state
- **AND** the response uses the standard success envelope

#### Scenario: Reject invalid post input
- **WHEN** a user submits invalid post input
- **THEN** the API returns a validation error envelope
- **AND** no partial post is created

### Requirement: Discover comments SHALL respect post visibility
The system SHALL allow comments only on posts that can accept public interaction.

#### Scenario: User comments on visible post
- **WHEN** an authenticated user submits valid comment input for a visible post
- **THEN** the API creates a comment linked to that post and actor
- **AND** the response uses the standard success envelope

#### Scenario: Reject comment on unavailable post
- **WHEN** a user attempts to comment on a missing, hidden, deleted, or non-visible post
- **THEN** the API returns a stable error envelope
- **AND** no orphan comment is created

### Requirement: Discover report and moderation SHALL provide a governance path
The system SHALL provide a minimum report and admin moderation path that changes public visibility without bypassing the BFF.

#### Scenario: User reports a visible post
- **WHEN** a user submits a valid report for a visible post
- **THEN** the API records or reflects the report state on that post
- **AND** public visibility follows the configured launch report behavior

#### Scenario: Admin moderates a post
- **WHEN** an authorized admin hides or deletes a post through the moderation route
- **THEN** subsequent public feed and detail reads do not expose that post

#### Scenario: Non-admin cannot moderate posts
- **WHEN** a non-admin actor calls the admin moderation route
- **THEN** the API returns a forbidden error envelope
- **AND** the post state is not mutated
