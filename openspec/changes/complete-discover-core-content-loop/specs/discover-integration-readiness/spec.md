## ADDED Requirements

### Requirement: Discover launch baseline SHALL include comment reads and owner post reads
The system SHALL extend the discover launch baseline beyond public post reads and write-only comments to include durable comment reads and current-user post reads.

#### Scenario: Read comments after posting
- **WHEN** a user submits a valid comment on a visible post and then reloads the post detail comment list
- **THEN** the created comment appears in the comment read response
- **AND** the post `comment_count` reflects the created comment
- **AND** public `comment_count` continues to exclude comments that later become hidden, deleted, or otherwise unavailable

#### Scenario: Owner sees own non-public post
- **WHEN** a user's own post is hidden from the public feed because of review or moderation state
- **THEN** the user's own-posts endpoint can return that post with its status
- **AND** the public list and public detail endpoints continue to hide it

### Requirement: Discover mobile pages SHALL consume real core data
The mobile discover experience SHALL render comments, media, author summary, timestamps, counters, and my-posts from API-backed data rather than hardcoded placeholders.

#### Scenario: Open post detail
- **WHEN** a user opens a discover detail page
- **THEN** the page loads post detail and the comment list from API-backed endpoints
- **AND** it does not render hardcoded comment fixtures as persisted comments

#### Scenario: Open my posts
- **WHEN** a user opens `pages/more/my-posts`
- **THEN** the page loads the current actor's discover posts
- **AND** it no longer displays phase-placeholder copy as the primary experience
