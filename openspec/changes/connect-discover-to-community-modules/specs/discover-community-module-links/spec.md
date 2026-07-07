## ADDED Requirements

### Requirement: Discover posts SHALL support place and event associations
The system SHALL allow discover posts to associate with visible community places and events through nullable `place_id` and `event_id` fields.

#### Scenario: Create post associated with place
- **WHEN** a user creates a post with a valid published place id in the active community
- **THEN** the post stores `place_id`
- **AND** post detail can render a safe place association card

#### Scenario: Create post associated with event
- **WHEN** a user creates a post with a valid public event id in the active community
- **THEN** the post stores `event_id`
- **AND** post detail can render a safe event association card

#### Scenario: Reject unavailable association
- **WHEN** a user submits a missing, unpublished, hidden, deleted, offline, or cross-community place or event association
- **THEN** the API returns a validation or not-found error envelope
- **AND** no partial post is created

### Requirement: Place and event detail SHALL expose related discover posts
The system SHALL expose lightweight related discover posts from place and event detail flows without leaking moderated or unavailable content.

#### Scenario: Read place related posts
- **WHEN** a client opens a published place detail
- **THEN** the place experience can load visible discover posts associated with that place
- **AND** each related result uses card-safe post fields

#### Scenario: Read event related posts
- **WHEN** a client opens a public event detail
- **THEN** the event experience can load visible discover posts associated with that event
- **AND** users can navigate from a related card to discover detail

### Requirement: Discover author display SHALL use profile-backed data
The system SHALL replace hardcoded discover author maps with profile-backed display summaries.

#### Scenario: Render post author
- **WHEN** a client renders a discover post authored by a known user
- **THEN** the author display uses profile-backed nickname, avatar, and public handle data
- **AND** the client can navigate to that user's profile page

#### Scenario: Render unavailable author
- **WHEN** the author profile is missing, suspended, or not publicly visible
- **THEN** the system returns a safe fallback author summary
- **AND** private user fields are not exposed

### Requirement: Discover actions SHALL create relevant notifications
The system SHALL create discover-related notifications for comments, replies, moderation outcomes, report resolutions, and followed-user activity where recipient and preference rules allow. Report-resolution notifications SHALL require the durable report-case workflow from `harden-discover-governance-console`; without that upstream capability they remain explicitly deferred.

#### Scenario: Notify post author of new comment
- **WHEN** a user comments on another user's visible post
- **THEN** the post author receives a notification linked to the post and comment
- **AND** the commenting actor does not receive a duplicate self-notification

#### Scenario: Notify report resolution
- **WHEN** the durable report-case workflow is implemented and an admin resolves a report case with a user-visible outcome
- **THEN** the reporter receives a notification summarizing the outcome without exposing private admin notes
